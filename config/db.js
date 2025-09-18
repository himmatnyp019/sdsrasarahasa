import mongoose from "mongoose";

export const connectDB = async ()=>{
    await mongoose.connect('mongodb+srv://himmateu:easypassword@rasarahasa1.til1vxu.mongodb.net/food-del').then(()=>console.log("Database connected"))
}