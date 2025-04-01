import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import statRoutes from './routes/Stat.js';
import userRoutes from './routes/userRoutes.js';
import { User } from './models/User.js'; // Import User model
import bodyParser from 'body-parser';


// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET environment variable is not set!');
  process.exit(1);
}
console.log('JWT_SECRET is set.');

// MongoDB Connection URI
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Event';

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('✅ Database connected successfully');

    // Create test user and generate JWT token for debugging purposes
    try {
      let testUser = await User.findOne({ email: 'test@example.com' });
      if (!testUser) {
        testUser = new User({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'hashedpassword123', // Note: Replace this with bcrypt hashed password
          type: 'student',
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
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });


// Allow only the frontend's origin
const corsOptions = {
  origin: 'https://event-management-system-frontend-eight.vercel.app', // Your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // Parse incoming JSON payloads

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/event', eventRoutes);
app.use('/api/stat', statRoutes);
app.use('/api/user', userRoutes);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to serve uploaded files
app.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
