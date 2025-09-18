import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModels.js";

const addReview = async (req, res) => {
    try {

        let image = req.file ? req.file.path : "null";
        const { itemId, message, rating, status } = req.body;
        const userId = req.userId;

        if (!itemId || !userId) {
            return res.status(400).json({ success: false, message: "Invalid request." });
        }
        const user = await userModel.findById(userId); //1
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let name = user.name;
        const updatedReview = await reviewModel.findOneAndUpdate(
            { itemId, userId }, // match by item and user
            {
                name,
                image,
                message,
                rating,
                status,
                time: new Date().toLocaleString("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                })
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        const isUpdate = !!(updatedReview && updatedReview._id);
        res.status(200).json({
            success: true,
            message: isUpdate ? "Review updated." : "Review added.",
            review: updatedReview
        });

    } catch (error) {
        console.log("Error adding/updating the review:", error);
        res.status(500).json({ success: false, message: "Please try again later." });
    }
};


const getReview = async (req, res) => {
    try {
        const userId = req.userId;  // set by your middleware //
        const { itemId } = req.body; // or req.params depending on your route

        if (!userId) {
            return res.status(401).json({ success: false, message: "Please log in your account." });
        }


        // Get all reviews for this product
        // Load all reviews
        const reviews = await reviewModel.find({}) || [];
        let reviewData = [];
        let ownReview = [];
        if (itemId) {

            // Reviews for this product
            reviewData = reviews.filter(r => r.itemId.toString() === itemId.toString()) || [];
            // This user's review for this product
            ownReview = reviewData.find(r => r.userId.toString() === userId.toString()) || null;
        }

        // All reviews by this user (across all products)
        const allOwnReview = reviews.filter(r => r.userId.toString() === userId.toString()) || [];

        res.json({ success: true, reviews: reviewData, ownReview: ownReview, allOwnReview: allOwnReview });
    } catch (error) {
        console.error("Error loading reviews:", error);
        res.status(500).json({ success: false, message: "Error to load reviews." });
    }
};

//for admin to review and valildate
const getSpecificReview = async (req, res) => {
    try {
        const adminId = req.userId;  // set by your middleware //
        const { userId } = req.body; // or req.params depending on your route

        if (!userId) {
            return res.status(401).json({ success: false, message: "User doesnot found. Please select user again." });
        }

        // Get all reviews for this product
        // Load all reviews of that user.
        const reviews = await reviewModel.find({ userId }) || [];

        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Error loading reviews:", error);
        res.status(500).json({ success: false, message: "Error to load reviews." });
    }
};
const removeReview = async (req, res) => {
    try {
        const reviewId = req.body.reviewId;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized: no user found." });
        }
        if (!reviewId) {
            return res.status(400).json({ success: false, message: "Please provide reviewId." });
        }

        const review = await reviewModel.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // // Optional: ensure the review belongs to this user
        // if (review.userId.toString() !== userId.toString()) {
        //     return res.status(403).json({ success: false, message: "You can only delete your own review." });
        // }

        await reviewModel.findByIdAndDelete(reviewId);
        res.json({ success: true, message: "Review deleted." });

    } catch (error) {
        console.error("Failed to delete review:", error);
        res.status(500).json({ success: false, message: "Failed to delete the review. Please try again." });
    }
};
const updateStatus = async (req, res) => {
    const { status, reviewId } = req.body;

    try {

        if (!status) {
            res.json({ success: false, message: "Please add status for this review." })
        }
        if (!reviewId) {
            res.json({ success: false, message: "Please specify the review to update." })
        }

        const review = await reviewModel.findByIdAndUpdate(
            reviewId,
            { status },
            { new: true }
        );
        if (!review) {
            res.json({ success: false, message: "Unable to update the review. Please refresh & try again" })
        }
        res.json({ success: true, message: "Status updated successfully.", data: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error.", error: error.message });

    }
}
export { addReview, removeReview, getReview, getSpecificReview, updateStatus };