import mongoose from "mongoose";
import { type } from "os";


const orderHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    date: { type: Date, default: Date.now },
    discount: { type: Number, default: 0 },
    items :{type:Array, required:true},
    totalPrice: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    deliveryAddress: { type: String },
    deliveredTo: { type: String },
    paymentMethod: { type: String, required: true }
}, { timestamps: true });

const historyModel = mongoose.models.history
    || mongoose.model("history", orderHistorySchema, "history");

export default historyModel;
