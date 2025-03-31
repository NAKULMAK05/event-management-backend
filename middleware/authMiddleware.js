import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Check headers: "Authorization" or "x-auth-token"
    let token = req.header("Authorization") || req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // If token is in "Bearer <token>" format, extract the actual token
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    // Verify the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?._id) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Find the user (exclude password) based on decoded token
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Set req.user and req.userId for compatibility
    req.user = user;
    req.userId = user._id; // Ensure userId is set in the request

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ error: "Token is not valid or expired" });
  }
};

export default authMiddleware;
