
import express from "express";
import { paymentComplete, webhookHandler, kakaoApprove, kakaoSetup } from "../controllers/paymentController.js"

const paymentRouter = express.Router();
// Complete payment manually (requires auth)
paymentRouter.post("/complete", paymentComplete);
// Webhook endpoint (PortOne calls this)
paymentRouter.post("/webhook", express.raw({ type: 'application/json' }), webhookHandler);
paymentRouter.post("/kakao/init",kakaoSetup);
paymentRouter.post('/kakao/approve', kakaoApprove)


export default paymentRouter;