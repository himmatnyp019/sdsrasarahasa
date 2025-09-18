import { addReview,removeReview,getReview, getSpecificReview, updateStatus } from "../controllers/reviewController.js";
import authMiddleware from "../middleware/auth.js";
import express  from "express"
import upload from '../config/multer.js'

const reviewRoute = express.Router();

//code for image storage
reviewRoute.post("/add", upload.single("image"), authMiddleware, addReview);
reviewRoute.post("/get", authMiddleware, getReview);
reviewRoute.post("/delete", authMiddleware, removeReview);
reviewRoute.post("/get/admin", authMiddleware, getSpecificReview);
reviewRoute.post("/status", updateStatus);
export default reviewRoute;
