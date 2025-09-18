import mongoose from "mongoose";

const sliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please write title for this page."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please write description for this page."],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL."],
    },
    icon: {
      type: String,
      default: "", // optional
    },
    link: {
      type: String,
      default: "", // optional
    },
  },
  { timestamps: true }
);
const SliderModel  = mongoose.models.slider || mongoose.model("slider", sliderSchema);

export default SliderModel;
