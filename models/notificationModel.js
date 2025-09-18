import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Notification description is required"],
    },
    type: {
      type: String,
      enum: ["text", "html", "image"],
      default: "text",
      required: true,
    },
    content: {
      type: String, // for HTML or extra content
    },
    image: {
      type: String, // URL of image if type=image
    },
    action: {
      type: String, // URL or route to go when clicked
      required: [true, "Action URL is required"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // associate notification with a user
      required: true,
    },
  },
  { timestamps: true }
);

// Export model as default
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
