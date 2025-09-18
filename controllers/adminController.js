import { log } from 'console'
import adminModel from '../models/adminModel.js'
import fs from 'fs';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import { create } from 'domain';
import { ifError } from 'assert';
import dotenv from "dotenv";
dotenv.config();


const logIn = async (req, res) => {
   const { email, password } = req.body;

   try {
      const user = await adminModel.findOne({ email });

      if (!user) {
         return res.json({ success: false, message: "User does not exist with this email. Please register an account." });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
         return res.json({ success: false, message: "Password or email address does not match." });
      }

      // ✅ Update status to "logged in"
      user.status = "logged in";
      await user.save();

      const token = createToken(user._id);
      res.json({ success: true, token, message: "Logged in successfully", status: user.status });

   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Server error" });
   }
};

const createToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
};
//registering user first time login
const registerUser = async (req, res) => {
   const { email, password, role } = req.body;
   try {
      const exists = await adminModel.findOne({ email })
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

      const user = new adminModel({
         name: req.body.name,
         phone: req.body.phone,
         email: email,
         password: hashedPassword,
         role:role

      })

      const adminData = await user.save();
      const token = createToken(adminData._id)
      res.json({ success: true, message: "User added", token })
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" + error })
   }
}


const logOut = async (req, res) => {
  const userId = req.userId;

   try {
      const user = await adminModel.findOne({ userId });

      if (!user) {
         return res.json({ success: false, message: "User does not exist. Please register an account." });
      }

      // ✅ Update status to "logged in"
      user.status = "logged out";
      await user.save();

      const token = createToken(user._id);
      res.json({ success: true, token, message: "Logged out successfully", status: user.status });

   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Server error" });
   }
};


//get user data 
const getAdminInfo = async (req, res) => {

   try {
      const userId = req.userId;
      if (!userId) {
         return res.status(401).json({ success: false, message: "Unauthorized: no userId" });
      }
      const user = await adminModel.findById(userId);

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
      const users = await adminModel.find({});
      res.json({ success: true, data: users })
   } catch (error) {
      console.error("FailedRetrive User Data : ", error);
      res.status(500).json({ success: false, message: "Internal Error Occurs." })
   }
}


export { logIn, logOut, registerUser, getAdminInfo, getAllUser }