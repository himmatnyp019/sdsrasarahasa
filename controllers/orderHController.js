
import userModel from "../models/userModels.js"
import adminModel from "../models/adminModel.js";
import historyModel from "../models/historyModel.js"
import fs from "fs"
import mongoose from "mongoose";

export const addOrderHistory = async (req, res) => {
  try {
    const {
      userId,
      date,
      discount,
      items,
      totalPrice,
      deliveryCharge,
      deliveryAddress,
      deliveredTo,
      paymentMethod
    } = req.body;

    if (!userId || !items || !totalPrice || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (userId, items, totalPrice, paymentMethod)."
      });
    }

    const newHistory = new historyModel({
      userId: new mongoose.Types.ObjectId(userId),
      date: date ? new Date(date) : Date.now(),
      discount: discount || 0,
      items,
      totalPrice,
      deliveryCharge: deliveryCharge || 0,
      deliveryAddress,
      deliveredTo,
      paymentMethod
    });

    await newHistory.save();

    res.status(201).json({
      success: true,
      message: "Order added to history.",
      data: newHistory
    });
  } catch (err) {
    console.error("Error adding order history:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);
    if (!user) {
      res.json({ success: false, message: "User not found. Please re-login." })
    }

    const historyData = await historyModel.find({ userId }) || [];

    const productIds = productID(historyData);
    res.json({ success: true, orderHistory: historyData, keys: productIds });

  } catch (error) {
    console.log("getHistory Error :", error)
    res.status(500).json({ success: false, message: "Failed to load order history data." })
  }
}

function productID(data) {
  let itemsArray = [];
  data.forEach(products => {
    products.items.forEach(item => {
      itemsArray.push(item.id);
    });
  });
  return itemsArray;
}


export const getSpecificHistory = async (req, res) => {
  try {
    const adminId = req.userId;
    const userId = req.params.userId;

    const admin = await adminModel.findById(adminId)
    if (!admin) {
      res.json({ success: false, message: "Admin data not found. Please login." })
    }

    const historyData = await historyModel.find({ userId }) || [];

    const productIds = productID(historyData);
    res.json({ success: true, orderHistory: historyData, keys: productIds });

  } catch (error) {
    console.log("getHistory Error :", error)
    res.status(500).json({ success: false, message: "Failed to load order history data." })
  }
}

