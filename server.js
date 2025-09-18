// import dotenv from "dotenv";
// dotenv.config();
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoutes.js';
import 'dotenv/config'
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import historyRoute from './routes/orderHRoute.js';
import orderRouter from './routes/orderRoute.js';
import reviewRoute from './routes/reviewRoute.js'
import sliderRouter from './routes/sliderRoute.js';
import chatRouter from './routes/chatRoute.js';
import adminRouter from './routes/adminRoute.js';
import kakaoRouter from './routes/kakaoRoute.js'
import passwordResetRoute from "./routes/passwordResestRoute.js";
import NotifyRouter from './routes/notificationRoute.js';
import paymentRouter from './routes/paymentRoute.js';


import path from 'path'
//app config
const app = express();
const port = 5000

//middleware
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", passwordResetRoute);

//db connection from here
connectDB();
// connectCloudinary();
//api endpoint
app.use("/api/food", foodRouter)
app.use("/images", express.static("uploads"))

app.use("/api/user", userRouter)
app.use("/images", express.static("profileImages"))

app.use("/api/admin", adminRouter);
app.use("/api/notifications", NotifyRouter);

app.use("/api/cart", cartRouter)
app.use("/api/address",addressRouter)
//order taking 
app.use("/api/order", orderRouter)

app.use("/api/payment", paymentRouter);

app.use("/api/history", historyRoute);
app.use("/reviewsImages", express.static("reviewsImages"));

//review endpoints
app.use("/api/review",reviewRoute)

app.get("/", (req, res)=>{
    res.send("API is working")
})
app.use("/api/sliders", sliderRouter);
//chatting view
app.use("/api/chat", chatRouter);
//run express server
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))
);

//kakao Paymant
app.use("/api/kakao", kakaoRouter);


app.listen(port, ()=>{
    console.log(`Server Started on http://localhost:${port}`)
})
