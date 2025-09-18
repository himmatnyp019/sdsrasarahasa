import express from 'express'
import kakaoController  from "../controllers/kakaoController.js";

const kakaoRouter = express.Router();
// Payment Ready
kakaoRouter.post("/pay", kakaoController.kakaoPay);

// Payment Approve
kakaoRouter.post("/approve", kakaoController.kakaoApprove);

// Payment Check
kakaoRouter.post("/check", kakaoController.kakaoCheck);

export default kakaoRouter;