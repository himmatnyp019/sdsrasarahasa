import { addOrderHistory, getOrderHistory,getSpecificHistory } from "../controllers/orderHController.js";
import authMiddleware from "../middleware/auth.js";
import express from "express";

const historyRoute = express.Router();

// Adds a new order history entry to the authenticated user
historyRoute.post("/add", addOrderHistory);
historyRoute.get("/get", authMiddleware, getOrderHistory);
historyRoute.get("/get/specific/:userId", authMiddleware, getSpecificHistory);

export default historyRoute;
