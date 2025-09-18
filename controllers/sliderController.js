import SliderModel from "../models/sliderModel.js";

// Add a new slider
export const addSlider = async (req, res) => {
  try {
    const { title, description, image, icon, link } = req.body;

    const newSlider = new SliderModel({ title, description, image, icon, link });
    await newSlider.save();

    res.status(201).json({ success: true, data: newSlider });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all sliders
export const getSliders = async (req, res) => {
  try {
    const sliders = await SliderModel.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sliders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove a slider by ID
export const removeSlider = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await SliderModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Slider not found" });
    }

    res.status(200).json({ success: true, message: "Slider removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
