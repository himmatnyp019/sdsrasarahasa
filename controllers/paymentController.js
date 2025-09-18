import axios from 'axios'
import { PortOneClient } from "@portone/server-sdk";
import 'dotenv/config';
const portone = PortOneClient({ secret: process.env.PORTONE_SECRET_KEY });

// In-memory payment store
const paymentStore = new Map();

/**
 * Complete payment manually
 */
export const paymentComplete = async (req, res, next) => {
  try {
    const { paymentId } = req.body;

    if (typeof paymentId !== "string") {
      return res.status(400).json({ success: false, message: "Invalid request: paymentId required" });
    }

    const payment = await syncPayment(paymentId);

    if (!payment) {
      return res.status(400).json({ success: false, message: "Payment synchronization failed" });
    }

    return res.status(200).json({ success: true, status: payment.status });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment and synchronize with store
 */

async function syncPayment(paymentId) {
  if (!paymentStore.has(paymentId)) {
    paymentStore.set(paymentId, { status: "PENDING" });
  }

  const paymentRecord = paymentStore.get(paymentId);
  let actualPayment;

  try {
    actualPayment = await portone.payment.getPayment({ paymentId });
  } catch (e) {
    // Handle specific error types based on the SDK's error structure
    if (e.data && e.data.type) {
      switch (e.data.type) {
        case 'InvalidRequestError':
          console.error("Invalid request:", e.data);
          break;
        case 'UnauthorizedError':
          console.error("Unauthorized access:", e.data);
          break;
        default:
          console.error("Payment retrieval failed:", e);
      }
    } else {
      console.error("An unexpected error occurred:", e);
    }
    return false;
  }

  if (actualPayment.status === "PAID") {
    if (!verifyPayment(actualPayment)) return false;
    if (paymentRecord.status === "PAID") return paymentRecord;
    paymentRecord.status = "PAID";
    console.info("Payment success:", actualPayment);
  } else {
    return false;
  }

  return paymentRecord;
}
/**
 * Verify the payment with expected values
 */
function verifyPayment(payment) {
  if (payment.channel.type !== "LIVE") return false;
  if (!payment.customData) return false;

  const customData = JSON.parse(payment.customData);
  const item = items.get(customData.item); // Ensure `items` map exists globally
  if (!item) return false;

  return (
    payment.orderName === item.name &&
    payment.amount.total === item.price &&
    payment.currency === item.currency
  );
}

/**
 * PortOne webhook handler
 */
export const webhookHandler = async (req, res, next) => {
  try {
    let webhook;
    try {
      webhook = await Webhook.verify(
        process.env.V2_WEBHOOK_SECRET,
        req.body,
        req.headers
      );
    } catch (e) {
      if (e instanceof Webhook.WebhookVerificationError) return res.status(400).end();
      throw e;
    }

    if (webhook?.data?.paymentId) {
      await syncPayment(webhook.data.paymentId);
    }

    res.status(200).end();
  } catch (error) {
    next(error);
  }
};


// *
// * kakao pay integration

export const kakaoSetup = async (req, res) => {
  try {
    const response = await axios.post(
      "https://kapi.kakao.com/v1/payment/ready",
      null,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          cid: process.env.CID,
          partner_order_id: "order-id-1234",
          partner_user_id: "user-id-5678",
          item_name: "Sample Product",
          quantity: 1,
          total_amount: 1000,
          vat_amount: 0,
          tax_free_amount: 0,
          approval_url: `${process.env.FRONTEND_REDIRECT_URL}`,
          cancel_url: `${process.env.FRONTEND_REDIRECT_URL}?cancel=true`,
          fail_url: `${process.env.FRONTEND_REDIRECT_URL}?fail=true`,
        },
      }
    );

    res.json({
      tid: response.data.tid,
      redirect_url: response.data.next_redirect_pc_url,
    });
  } catch (err) {
    console.error("Payment Ready Error:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment setup failed" });
  }
}

//--------------------Tid-------------
let storedTid = null; // Simple in-memory storage for now
export const kakaoPay = async (req, res) => {
  try {
    const { item_name, quantity, total_amount } = req.body;

    const response = await axios.post('https://kapi.kakao.com/v1/payment/ready', null, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      params: {
        cid: 'TC0ONETIME',
        partner_order_id: 'order_id_1234',
        partner_user_id: 'user_id_1234',
        item_name,
        quantity,
        total_amount,
        vat_amount: 0,
        tax_free_amount: 0,
        approval_url: `${process.env.FRONTEND_REDIRECT_URL}`,
        cancel_url: `${process.env.FRONTEND_CANCEL_URL}`,
        fail_url: `${process.env.FRONTEND_FAIL_URL}`,
      },
    });

    storedTid = response.data.tid; // Store tid

    res.json({ next_redirect_pc_url: response.data.next_redirect_pc_url });
  } catch (err) {
    console.error('KakaoPay Ready Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'KakaoPay preparation failed' });
  }
};

//-----------------approve---------
export const kakaoApprove = async (req, res) => {
  try {
    const { pg_token } = req.body;

    const response = await axios.post('https://kapi.kakao.com/v1/payment/approve', null, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
      params: {
        cid: 'TC0ONETIME',
        tid: storedTid, // from earlier step
        partner_order_id: 'order_id_1234',
        partner_user_id: 'user_id_1234',
        pg_token,
      },
    });

    res.json({ status: 'approved', data: response.data });
  } catch (err) {
    console.error('KakaoPay Approval Error:', err.response?.data || err.message);
    res.status(500).json({ message: 'KakaoPay approval failed' });
  }
};

export const check = async (req, res) => {
  try {
    const { tid } = req.body;

    const response = await axios.post("https://kapi.kakao.com/v1/payment/order", null, {
      headers: {
        Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      params: {
        cid: process.env.CID,
        tid,
      },
    });

    res.json({ status: response.data.status }); // READY, PAID, CANCEL, etc.
  } catch (err) {
    console.error("Check error:", err.response?.data || err.message);
    res.status(500).json({ message: "Check failed" });
  }
};