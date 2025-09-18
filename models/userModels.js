import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Please add the name."] },
    phone: { type: String, required: [true, "Please add phone number."] },
    email: { type: String, required: [true, "Please add email address."], unique: [true, "Email address is already in use."] },
    password: { type: String, required: [true, "Please type password."] },
    image: { type: String, required: [true, "Please Add profile image."] },
    cartData: { type: Object, default: {} },
    status:{type:String, default:"normal"},
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    address: { type: Object, default: [{}, {}, {}], required: [false, "Address can be added later."] }

}, {
    timestamps: true,
    minimize: false
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel; 