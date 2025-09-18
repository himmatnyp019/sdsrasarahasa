
import userModel from '../models/userModels.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import dotenv from "dotenv";
dotenv.config();

const logIn = async (req, res) => {
   const { email,phone, password } = req.body;

   try {

      const user = await userModel.findOne({ email });

      if (!user) {
         return res.json({ success: false, message: "User does not exist with this email. Please register an account." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
         return res.json({ success: false, message: "Password or email address does not match." });
      }
      const token = createToken(user._id);
      res.json({ success: true, token, message: "Logged in successfully" });

   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Server error" });
   }
}
const createToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
//registering user first time login
const registerUser = async (req, res) => {
   const { email, phone, password } = req.body;
   try {
      const exists = await userModel.findOne({ email })
      let phoneExit;
      if (phone) {
         phoneExit = await userModel.findOne({ phone })
      }
      if (phoneExit) {
         return res.json({ success: false, message: "Phone number already in use. Try another." })
      }
      if (exists) {
         return res.json({ success: false, message: "User already exists. please log-in." })
      }

      //validating the email and checking for the strong password
      if (!validator.isEmail(email)) {
         return res.json({ success: false, message: "Please enter valid email address." })
      }
      if (password.length < 8) {
         return res.json({ success: false, message: "Please enter more than 8 characters." })
      }

      //bcrypt user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      let image_filename = req.file ? req.file.filename : "null";

      const user = new userModel({
         name: req.body.name,
         phone: req.body.phone,
         email: email,
         password: hashedPassword,
         image: image_filename,
         cartData: req.body.cartData,
         address: req.body.address
      })

      const userData = await user.save();
      const token = createToken(userData._id)
      res.json({ success: true, message: "User added", token })
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" + error })
   }
}
//get user data 
const getUserInfo = async (req, res) => {
   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({ success: false, message: "Unauthorized: no userId" });
      }
      const user = await userModel.findById(userId);

      if (!user) {
         return res.status(404).json({ success: false, message: "User not found." });
      }

      res.json({ success: true, user: user })

   } catch (error) {
      console.log(error)
      res.json({ success: false, message: error })
   }

}

const getAllUser = async (req, res) => {
   try {
      const users = await userModel.find({});
      res.json({ success: true, data: users })
   } catch (error) {
      console.error("FailedRetrive User Data : ", error);
      res.status(500).json({ success: false, message: "Internal Error Occurs." })
   }
}


const updateInfo = async (req, res) => {
   try {
      const userId = req.userId;
      const { name, phone, email } = req.body;
      let image = req.file ? req.file.path : "null";

      const updatedUser = await userModel.findByIdAndUpdate(
         userId,
         {
            $set: {
               ...(name && { name }),
               ...(phone && { phone }),
               ...(email && { email }),
               ...(image && { image })
            }
         },
         { new: true } // return updated doc
      );

      if (!updatedUser) {
         return res.status(404).json({ success: false, message: "User not found. Please register account." });
      }

      return res.status(200).json({ success: true, data: updatedUser });
   } catch (error) {
      console.error("Update Info Error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
   }
};


//registering user first time login
const resetPass = async (req, res) => {
   const userId = req.userId;
   const { password } = req.body;
   try {
      const exists = await userModel.findOne({ userId })

      if (!exists) {
         return res.json({ success: false, message: "User doesnot exist with this email id. Please register new account." })
      }

      if (password.length < 8) {
         return res.json({ success: false, message: "Please enter more than 8 characters." })
      }

      //bcrypt user password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const updatedPass = await userModel.findByIdAndUpdate(
         userId,
         {
            $set: {
               ...(hashedPassword && { password }),
            }
         },
         { new: true } // return updated doc
      );

      if (!updatedPass) {
         return res.status(404).json({ success: false, message: "Failed to reset password. Please try again later." });
      }
      const token = createToken(userId);
       return res.json({ success: true, message: "Password reset successfully.", token })

   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" + error })
   }
}

export { logIn, resetPass, updateInfo, registerUser, getUserInfo, getAllUser }