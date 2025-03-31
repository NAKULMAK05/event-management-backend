import express from "express";
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  likeEvent,
  addComment,
} from "../controllers/eventController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Event CRUD routes
// Create an event
router.post("/create", authMiddleware, createEvent);

// Get all events (can add pagination or filtering if needed)
router.get("/getevent", getEvents);

// Update an event by its ID
router.put("/:id", authMiddleware, updateEvent);  // Ensure you're updating an event by its ID in the body

// Delete an event by its ID
router.delete("/:id", authMiddleware, deleteEvent);

// Like an event by its ID
router.put("/:id/like", authMiddleware, likeEvent);

// Add a comment to an event by its ID
router.post("/:id/comment", authMiddleware, addComment);

export default router;
