import express from 'express';
import {
  getTrendingMovies,
  getMovieDetails,
  searchMovies,
  discoverMoviesFromTMDB // ✅ Import the new controller
} from '../controllers/tmdbController.js';

const router = express.Router();

// Trending movies (supports pagination via ?page=)
router.get('/trending', getTrendingMovies);

// Search movies by query
router.get('/search', searchMovies);

// Get single movie details
router.get('/movie/:id', getMovieDetails);

// 🔍 Discover movies with filters for AI (genre, language, decade, mood)
router.get('/discover', discoverMoviesFromTMDB); // ✅ NEW ROUTE

export default router;
