import 'dotenv/config'
// Simple in-memory storage (later move to DB)
let storedTid = null;

const kakaoPay = async (req, res) => {
  try {
    const { item_name, quantity, total_amount } = req.body;

    const response = await axios.post(
      "https://kapi.kakao.com/v1/payment/ready",
      null,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          cid: process.env.CID || "TC0ONETIME",
          partner_order_id: "order_id_1234",
          partner_user_id: "user_id_1234",
          item_name,
          quantity,
          total_amount,
          vat_amount: 0,
          tax_free_amount: 0,
          approval_url: process.env.FRONTEND_REDIRECT_URL,
          cancel_url: process.env.FRONTEND_CANCEL_URL,
          fail_url: process.env.FRONTEND_FAIL_URL,
        },
      }
    );

    storedTid = response.data.tid; // save tid temporarily

    res.json({
      tid: response.data.tid,
      next_redirect_pc_url: response.data.next_redirect_pc_url,
    });
  } catch (err) {
    console.error("KakaoPay Ready Error:", err.response?.data || err.message);
    res.status(500).json({ message: "KakaoPay preparation failed" });
  }
};

const kakaoApprove = async (req, res) => {
  try {
    const { pg_token } = req.body;

    const response = await axios.post(
      "https://kapi.kakao.com/v1/payment/approve",
      null,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          cid: process.env.CID || "TC0ONETIME",
          tid: storedTid,
          partner_order_id: "order_id_1234",
          partner_user_id: "user_id_1234",
          pg_token,
        },
      }
    );

    res.json({ status: "approved", data: response.data });
  } catch (err) {
    console.error("KakaoPay Approval Error:", err.response?.data || err.message);
    res.status(500).json({ message: "KakaoPay approval failed" });
  }
};

const kakaoCheck = async (req, res) => {
  try {
    const { tid } = req.body;

    const response = await axios.post(
      "https://kapi.kakao.com/v1/payment/order",
      null,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
          "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
        },
        params: {
          cid: process.env.CID || "TC0ONETIME",
          tid,
        },
      }
    );

    res.json({ status: response.data.status }); // READY, PAID, CANCEL, etc.
  } catch (err) {
    console.error("KakaoPay Check Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Check failed" });
  }
};

export default {kakaoPay, kakaoApprove, kakaoCheck}