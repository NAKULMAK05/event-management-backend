import { User } from "../models/User.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔹 Multer Storage Configuration for Profile Photo Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 🔹 Get User Details
const getUserDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    // Select the photo field along with other details
    const user = await User.findById(userId).select("firstName lastName email photo");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Construct full URL for the photo if it exists
    const photoUrl = user.photo
      ? `${req.protocol}://${req.get("host")}/uploads/${user.photo}`
      : null;

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      photoUrl, // Return full URL in photoUrl
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// 🔹 Update User Profile (Text Fields Only)
const updateUserDetails = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized: No user ID found" });

    const { firstName, lastName, email } = req.body;
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: "First name, last name, and email are required" });
    }

    console.log(`Updating details for user: ${userId}`);
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔹 Update Profile Photo (Using Multer)
const updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized: No user ID found" });

    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const uploadDir = path.join(__dirname, "../uploads");

    // Delete old photo if exists
    if (user.photo) {
      const oldPhotoPath = path.join(uploadDir, user.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update and save new photo
    user.photo = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile photo updated successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photo: `${req.protocol}://${req.get("host")}/uploads/${user.photo}`, // Dynamic URL
      },
    });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// 🔹 Serve Uploaded Profile Photos
const serveProfilePhoto = (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "../uploads", filename);
  console.log('File path:', filePath); // Debug log for file path
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Profile photo not found" });
  }
};

// 🔹 Fetch User Suggestions (Full Name & Profile Photo)
const fetchUserSuggestions = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId }, type: { $ne: "organizer" } },
      "firstName lastName email photo" // Ensure photo is included
    );
    // Optionally, transform photo to full URL if stored as filename
    const transformedUsers = users.map(user => ({
      ...user._doc,
      photo: user.photo ? `${req.protocol}://${req.get("host")}/uploads/${user.photo}` : null,
    }));
    res.json(transformedUsers);
  } catch (err) {
    console.error("❌ Error fetching suggestions:", err.message);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};


export {
  getUserDetails,
  updateUserDetails,
  updateProfilePhoto,
  serveProfilePhoto,
  upload,
  fetchUserSuggestions,
};