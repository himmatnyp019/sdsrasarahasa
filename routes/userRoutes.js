import express from "express";
import upload from "../config/multer.js";
import { logIn, registerUser,getUserInfo,updateInfo, getAllUser } from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";


const userRouter = express.Router();

//image storage engine

userRouter.post("/register", upload.single("image"), registerUser);
userRouter.post("/update", authMiddleware, upload.single("image"), updateInfo);
userRouter.post("/login",upload.none(), logIn)
userRouter.get("/get",authMiddleware, getUserInfo)
userRouter.get("/get/all", getAllUser);

export default userRouter;