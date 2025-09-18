import express from "express";
import { addFood, listFood, removeFood, updateItem } from "../controllers/foodController.js";

import upload from "../config/multer.js";

const foodRouter = express.Router();

foodRouter.post("/add", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 }
]),  addFood);


foodRouter.get("/list", listFood)
foodRouter.post("/remove", removeFood)

foodRouter.post("/update", upload.fields([
  { name: "image", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 }
]), updateItem);


export default foodRouter;