import express from "express";
import { addSlider, getSliders, removeSlider } from "../controllers/sliderController.js";

const sliderRouter = express.Router();

// Add new slider
sliderRouter.post("/add", addSlider);

// Get all sliders
sliderRouter.get("/all", getSliders);

// Remove slider by ID
sliderRouter.delete("/:id", removeSlider);

export default sliderRouter;
