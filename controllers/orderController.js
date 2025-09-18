import orderModel from "../models/orderModel.js";
import userModel from "../models/userModels.js";
import express from 'express';
import bodyParser from "body-parser";
import { pushNotification } from "../utils/notify.js";

// Place order - just save to DB
export const placeOrder = async (req, res) => {
  try {
    const { items, amount, info, deliveryCharge, paymentMethod } = req.body;
    const userId = req.userId;
    // Basic validation
    if (!userId || !items || !amount || !info) {
      return res.status(500).json({
        success: false,
        message: "Missing required fields: userId, items, amount, or address",
      });
    }

    // Create new order
    const newOrder = new orderModel({
      userId,
      items,
      info,
      amount,
      deliveryCharge,
      paymentMethod
    });
    // Save order to DB
    await newOrder.save();
    // Clear user's cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Send success response
    res.status(201).json({
      success: true,
      message: "Order placed successfully but nothing",
      orderId: newOrder._id,
      order: newOrder
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({
      success: false,
      message: "Server error while placing order",
    });
  }
};
// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ time: -1 }); // latest orders first
    res.status(200).json({
      success: true,
      orders: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};
// Get orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    // authMiddleware already attaches userId to req.
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No user ID found",
      });
    }
    const orders = await orderModel.find({ userId }).sort({ time: -1 });
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user orders",
    });
  }
};


export const updateStatus = async (req, res) => {
  try {
    let {userId, orderId, status, refundStatus, payment } = req.body;

    if(!userId){
      return res.json({success:false, message:"User account not found."})
    }
    if (!orderId) {
      return res.status(400).json({ success: false, message: "Order ID required" });
    }

    let updatedOrder = await orderModel.findById(orderId);
    if (!updatedOrder) {
      res.json({ status: false, message: "Order not found" })
    }
    if (status) updatedOrder.status = status;
    if (refundStatus) updatedOrder.refundStatus = refundStatus;
    if (payment !== undefined) updatedOrder.payment = payment;

    await updatedOrder.save();

    await pushNotification({
      userId,
      title: "Your Order's status has been changed to " + status + ".",
      description: `Your review for item ${orderId} was posted.`,
      action: "/track",
    });


    if (refundStatus && refundStatus.isRefundComplete) {
       await pushNotification({
      userId,
      title: refundStatus.refundMethod,
      description: "We review your refund status. \n"+refundStatus.isRefundComplete,
      action: "/track",
    });
    }
    res.json({ success: true, message: "Order status updated", status, order: updatedOrder });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const payInCash = async (req, res) => {
  try {
    const { orderId, message } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: "Please select specific order." });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId,
      { messsage: message },  // new status
      { new: true } // return updated document
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: "Pay on cash order added.", order: updatedOrder });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};