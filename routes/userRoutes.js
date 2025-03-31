import express from "express";
import { getUserDetails, updateUserDetails, updateProfilePhoto, serveProfilePhoto, upload , fetchUserSuggestions} from "../controllers/UserController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/details", authMiddleware, getUserDetails);
router.put("/details", authMiddleware, updateUserDetails);
router.put("/update-photo", authMiddleware, upload.single("photo"), updateProfilePhoto);
router.get("/photo/:filename", serveProfilePhoto);
router.get("/suggestions", fetchUserSuggestions);
export default router;
