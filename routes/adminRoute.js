import express from "express";
import { logIn,logOut, registerUser,getAdminInfo, getAllUser } from "../controllers/adminController.js";
import authMiddleware from "../middleware/auth.js";


const adminRouter = express.Router();

adminRouter.post("/register", registerUser);
adminRouter.post("/login", logIn)
adminRouter.post("/logout", logOut)
adminRouter.get("/get",authMiddleware, getAdminInfo)
adminRouter.get("/get/all", getAllUser);

export default adminRouter;