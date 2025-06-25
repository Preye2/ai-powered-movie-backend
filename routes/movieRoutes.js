// backend/routes/movieRoutes.js
import express from 'express';
import {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  filterMovies,
} from '../controllers/movieController.js';

const router = express.Router();

router.get('/popular', getPopularMovies);
router.get('/search', searchMovies);
router.get('/details/:id', getMovieDetails);
router.get('/filter', filterMovies);

export default router;
