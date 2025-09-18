import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided. Please log in again."
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); // ✅ will throw if expired

    req.body = req.body || {}; // Prevent "Cannot set properties of undefined"
    req.userId = tokenDecode.id;
    next();
  } catch (error) {
    console.log("Auth error:", error.message);

    // ✅ Detect expired token
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again."
      });
    }

    return res.status(401).json({
      success: false,
      message: error.message || "Token verification failed."
    });
  }
};

export default authMiddleware;
