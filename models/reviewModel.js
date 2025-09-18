import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name not found."] },
    image: { type: String },
    message: { type: String, required: [true, "Please type something."] },
    itemId: { type: String, required: [true, "Choose the  valid item to post review."] },
    userId: { type: String, required: [true, "User not found. Please try again."] },
    rating: { type: Number, required: [true, "Please rate star."] },
    time: { type: String, required: true },
    status: { type: String, required:true }

}, {
    timestamps: true,
    minimize: false
})
// reviewSchema.index({ itemId: 1, userId: 1 }, { unique: true });

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema)

export default reviewModel;