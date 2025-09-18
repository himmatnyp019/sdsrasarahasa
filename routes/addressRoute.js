import express, { Router } from 'express'
import { updateAddress } from '../controllers/addressController.js'
import authMiddleware from '../middleware/auth.js'

const addressRouter = express.Router();

//api endpoints
addressRouter.post('/update', authMiddleware, updateAddress)

export default addressRouter;