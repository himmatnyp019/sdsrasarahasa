import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please add the name."] },
    phone: { type: String, required: [true, "Please add phone number."] },
    email: { type: String, required: [true, "Please add email address."], unique: [true, "Email address is already in use."] },
    password: { type: String, required: [true, "Please type password."] },
    status: { type: String, default: "registered" },
    role: { type: String, default: "none", },

}, {
    timestamps: true,
    minimize: false
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema)

export default adminModel; 