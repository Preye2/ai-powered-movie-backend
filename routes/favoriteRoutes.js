// backend/routes/favoriteRoutes.js
import express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../controllers/favoriteController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all routes below require authentication

router.post('/', addFavorite);
router.delete('/:movieId', removeFavorite);
router.get('/', getFavorites);

export default router;
