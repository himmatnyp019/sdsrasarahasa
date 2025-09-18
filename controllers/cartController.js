import userModel from '../models/userModels.js'


//add items to user's cart
const addToCart = async (req, res) => {
  try {
    let userId = req.userId;
    let userData = await userModel.findOne({ _id: userId });
    let cartData = userData.cartData;

    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }

    await userModel.findByIdAndUpdate(req.userId, { cartData });
    res.json({ success: true, message: "Added to Cart." });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Failed to add item in cart. Try again. " + error });
  }
};

//remove items from user's cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;  // set by your middleware //r
    const { itemId } = req.body;//r

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: no user found." });
    }
    if (!itemId) {
      return res.status(400).json({ success: false, message: "Please provide itemId" });
    }

    const user = await userModel.findById(userId); //1
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    let cartData = await user.cartData; //2

    if (!cartData[itemId]) {
      return res.json({ success: false, message: "Item not in cart." });
    }

    if (cartData[itemId] > 0) {//3
      cartData[itemId] -= 1;//4
    } else {
      delete cartData[itemId];
    }

    await userModel.findByIdAndUpdate(userId, { cartData });
    res.json({ success: true, message: "Item updated in cart." });

  } catch (error) {
    console.error("removeFromCart error:", error);
    res.status(500).json({ success: false, message: "Failed to remove item. " + error });
  }
};



//get items of user's cart (fetching)
const getCart = async (req, res) => {
  try {
    const userId = req.userId;  // from your middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: no userId" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const cartData = user.cartData || {};

    res.json({ success: true, cart: cartData });

  } catch (error) {
    console.error("getCart error:", error);
    res.status(500).json({ success: false, message: "Failed to get cart. " + error });
  }
};



export { addToCart, removeFromCart, getCart }