import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String, requred:true},
    description: {type:String, required:true},
    price:{type:Number, required:true},
    image:{type:String,  required:[true, "Please add at least one image."]},
    image2:{type:String },
    image3:{type:String},
    category:{type:String, required:true},
    discount:{type:Number}
},{
    timestamps:true,
    minimize:false
})

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema)

export default foodModel;