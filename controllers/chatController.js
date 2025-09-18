import chatModel from "../models/chatModel.js";
import userModel from "../models/userModels.js";
import foodModel from "../models/foodModels.js";
import mongoose from "mongoose";
import adminModel from "../models/adminModel.js"

// Helper: format time for responses (month, day, hour:minute, Asia/Seoul)
const formatDisplayTime = (date) => {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Seoul",
    }).format(date);
  } catch {
    return date?.toISOString?.() || "";
  }
};


export const addMessage = async (req, res) => {
  try {
    // Get userId from authMiddleware (req.body.userId)
    const uId = req.userId;
    console.log(uId + ' user ID')
    if (!uId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, Please login"
      });
    }
    const { message, productId , userId} = req.body;

    // Handle uploaded file via multer
    let uploadImg = null;
    if (req.file) {
      uploadImg = req.file.path || null;
    }
    // Must have at least one payload
    if (!message && !uploadImg && !productId) {
      return res.status(400).json({
        success: false,
        message: "Please type some text or product or image to send.",
      });
    }

    // Get authoritative user info from DB
    let user = {};
     user = await adminModel.findById(uId).select("name role");
     if (JSON.stringify(user).length <= 5) {
       user = await userModel.findById(uId).select("name image role");
     }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const payload = {
      userId,
      name: user.name || "User",
      profile_image: user.image || "",
      message: message || "",
      uploadImage: uploadImg || null,
      senderType: user.role === "admin" ? "admin" : "user",
      status: "sent",
    };

    // Optional product snapshot
    if (productId) {
      const prod = await foodModel.findById(productId).select("_id name price discount image");
      if (prod) {
        payload.product = {
          productId: prod._id,
          name: prod.name,
          price: prod.price,
          discount: prod.discount ?? 0,
          image: prod.image,
        };
      }
    }

    // Create message
    const chat = await chatModel.create(payload);

    return res.status(201).json({
      success: true,
      data: {
        ...chat.toObject(),
        displayTime: formatDisplayTime(chat.createdAt), // if you have this function
      },
    });

  } catch (err) {
    console.error("addMessage error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET messages for a specific userId (admin can view any; users only their own) {pastman tick}
export const getMessagesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.userId;
    const adminData = await adminModel.findById(me);
    if (!me) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // If not admin, only allow fetching own messages
    const isAdmin = adminData.role === "admin";
    // const isAdmin = false; //for now true
    if (!isAdmin && me !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Optional: convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const chats = await chatModel
      .find({ userId: userObjectId })
      .sort({ createdAt: 1 })
      .lean();

    const withDisplayTime = chats.map((c) => ({
      ...c,
      displayTime: formatDisplayTime(c.createdAt),
    }));
    return res.json({ success: true, data: withDisplayTime });
  } catch (err) {
    console.error("getMessagesByUserId error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET my messages (handy for user apps)  {postman tick}
export const getMyMessages = async (req, res) => {
  const userId = req.userId;
  try {
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized, Please re-login or refresh." });
    }
    const chats = await chatModel.find({ userId: userId })
      .sort({ createdAt: 1 })
      .lean();

    const withDisplayTime = chats.map((c) => ({
      ...c,
      displayTime: formatDisplayTime(c.createdAt),
    }));

    return res.json({ success: true, data: withDisplayTime });
  } catch (err) {
    console.error("getMyMessages error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE message (owner or admin only) {postman tick}
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;          // Message ID from URL
    const userId = req.userId;     // Comes from auth middleware
    if (!userId) {
      console.log("unauhtorized here");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Fetch message
    const msg = await chatModel.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Fetch user to check role (admin or not)
    let user = {};
    user = await userModel.findById(userId);
    if (!user) {
      user = await adminModel.findById(userId)
    }
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isAdmin = user.role === "admin";
    const isOwner = msg.userId.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    // Delete the message
    await chatModel.findByIdAndDelete(id);

    return res.json({ success: true, message: "Message deleted successfully" });
  } catch (err) {
    console.error("deleteMessage error:", err);
    return res.status(500).json({ success: false, message: "error" + err.message });
  }
};

export const getConversationList = async (req, res) => {
  try {
    const me = req.userId; // admin or current logged in user

    if (!me) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const adminData = await adminModel.findById(me);

    // Admin only can see all conversation list
    const isAdmin = adminData.role === "admin";
    
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // Step 1: Find latest message per userId
    const latestMessages = await chatModel.aggregate([
      {
        $sort: { updatedAt: -1 }, // sort by newest first
      },
      {
        $group: {
          _id: "$userId", // group by userId
          latestMessage: { $first: "$$ROOT" }, // pick the first (newest) message
        },
      },
      {
        $replaceRoot: { newRoot: "$latestMessage" },
      },
    ]);
    // Step 2: Fetch corresponding users info
    const userIds = latestMessages.map((m) => m.userId);
    const users = await userModel
      .find({ _id: { $in: userIds } })
      .select("name image");
    // Step 3: Merge user info with message info
    const conversations = latestMessages.map((msg) => {
      const user = users.find((u) => u._id.toString() === msg.userId.toString());
      return {
        userId: msg.userId,
        name: user?.name || "Unknown",
        profile_image: user?.profile_image || null,
        status: msg.status, // from latest message
        updatedAt: msg.updatedAt,
      };
    });

    // Step 4: Sort → first "sent" then by latest updatedAt
    conversations.sort((a, b) => {
      if (a.status === "sent" && b.status !== "sent") return -1;
      if (a.status !== "sent" && b.status === "sent") return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    return res.json({ success: true, data: conversations });
  } catch (err) {
    console.error("getConversationList error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// OPTIONAL: mark message as read (owner or admin)
// Useful if you add read receipts in UI
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const me = req.user;
    if (!me?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const msg = await chatModel.findById(id);
    if (!msg) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const isAdmin = me.role === "admin";
    const isOwner = String(msg.userId) === String(me.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    msg.status = "read";
    await msg.save();

    return res.json({
      success: true,
      data: { ...msg.toObject(), displayTime: formatDisplayTime(msg.createdAt) },
    });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
