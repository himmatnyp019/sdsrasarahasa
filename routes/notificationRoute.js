import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const NotifyRouter = express.Router();

// Create a notification
NotifyRouter.post("/post", createNotification);

// Get all notifications for a user
NotifyRouter.get("/:userId", getNotifications);

// Mark as read
NotifyRouter.put("/read/:id", markAsRead);

// Delete notification
NotifyRouter.delete("/:id", deleteNotification);

export default NotifyRouter;
