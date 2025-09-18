import express from 'express';
import authMiddleware from "../middleware/auth.js";
import { placeOrder ,updateStatus, getAllOrders, getUserOrders,payInCash } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post('/all', getAllOrders);
orderRouter.get('/my',  authMiddleware, getUserOrders );
orderRouter.post('/update',updateStatus);
orderRouter.post("/cash", authMiddleware,payInCash)
export default orderRouter;