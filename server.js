import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';

// Initialize dotenv to load environment variables
dotenv.config();

// Function to generate a random JWT secret
function generateJwtSecret() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if JWT_SECRET is defined; if not, generate and save i
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'undefined');

// Import other modules after environment setup
import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import statRoutes from './routes/Stat.js';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes.js';
import { fileURLToPath } from 'url';
import { User } from './models/User.js'; // Import User model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to the database and generate a test token
mongoose.connect("mongodb://localhost:27017/Event", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log("✅ Database connected successfully");

    // Generate a test JWT token for a sample user
    try {
      // Check if a test user exists; if not, create one
      let testUser = await User.findOne({ email: "test@example.com" });
      if (!testUser) {
        testUser = new User({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          password: "hashedpassword123", // In practice, hash this with bcrypt
          type: "student",
        });
        await testUser.save();
      }

      const token = testUser.generateAuthToken();
      console.log('Generated Test JWT Token at Startup:', token);
    } catch (error) {
      console.error('Error generating test JWT token at startup:', error);
    }
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

// Use middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/stat', statRoutes);
app.use('/api/user', userRoutes);

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});