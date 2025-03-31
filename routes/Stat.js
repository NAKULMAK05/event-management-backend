import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { updateLike, updateComment } from '../controllers/statsController.js';

const router = express.Router();

// Update like count (Protected Route)
router.post('/like/:eventId', authMiddleware, updateLike);

// Update comment count (Protected Route)
router.post('/comment/:eventId', authMiddleware, updateComment);

export default router;
