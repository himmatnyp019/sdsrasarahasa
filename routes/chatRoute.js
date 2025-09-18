// routes/chatRoutes.js
import express from "express";
import multer from "multer"
import upload from "../config/multer.js";
import {
  addMessage,
  getMessagesByUserId,
  getMyMessages,
  deleteMessage,
  markAsRead,
  getConversationList
} from "../controllers/chatController.js";
import authMiddleware from "../middleware/auth.js";

const chatRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/chat/"); // create folder if missing
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});


chatRouter.post("/add",authMiddleware,upload.single("uploadImage"), addMessage);
chatRouter.get("/me", authMiddleware, getMyMessages);
chatRouter.get("/user/:userId", authMiddleware, getMessagesByUserId);
chatRouter.delete("/delete/:id", authMiddleware, deleteMessage);
chatRouter.patch("/:id/read", authMiddleware, markAsRead);
chatRouter.get('/latest-users', authMiddleware,getConversationList )

export default chatRouter;
