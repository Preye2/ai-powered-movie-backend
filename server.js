// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import gptRoutes from './routes/gptRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import tmdbRoutes from './routes/tmdbRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';

import connectDB from './config/db.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Secure CORS setup for production
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// JSON parsing middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/gpt', gptRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Optional login passthrough route
app.post('/api/auth/login', (req, res, next) => {
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
