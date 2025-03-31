import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// POST request to register a user
router.post('/register', registerUser);

// POST request to login a user
router.post('/login', loginUser);

export default router;
