import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      // type:String,
      ref: "User",
      required: true,
    },
    name: { type: String }, // optional, can be derived from User
    profile_image: { type: String }, // optional avatar
    message: { type: String }, // text message
    uploadImage: { type: String }, // image url if uploaded in chat

    product: {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: { type: String },
      price: { type: Number },
      discount: { type: Number },
      image: { type: String },
    },

    senderType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
);
const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema)
export default chatModel;
