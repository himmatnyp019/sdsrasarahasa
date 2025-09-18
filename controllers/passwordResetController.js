import crypto from "crypto";
import bcrypt from "bcrypt";
import userModel from "../models/userModels.js"; // your existing user schema
import sendEmail from "../utils/sendEmail.js"; // reusable email sender
import 'dotenv/config'



// ============================
// FORGET PASSWORD
// ============================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 1. Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash the token (store hashed in DB, send plain to user)
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // 3. Save token + expiry on user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // valid for 15 minutes
    await user.save();

    // 4. Build reset link
    const resetUrl = `http://localhost:5173/reset/${resetToken}`;

    // 5. Send email
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message: `Click here to reset your password: ${resetUrl}`,
    });

    res.status(200).json({ success: true, message: "Reset email sent!" });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ success: false, message: "Email could not be sent" });
  }
};


// 2️⃣ Reset password using token
// ============================
// RESET PASSWORD
// ============================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // raw token from URL
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: "New password is required" });
    }

    // Hash token to match the stored one
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with matching reset token and valid expiry
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password
    user.password = hashedPassword;

    // Clear token fields so the link can't be reused
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};
