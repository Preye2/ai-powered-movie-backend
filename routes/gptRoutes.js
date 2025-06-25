import express from 'express';
import { recommendMovies } from '../controllers/gptController.js';

const router = express.Router();

// @route   POST /api/gpt/recommend
// @desc    Generate movie recommendations from AI
// @access  Public (or protected if needed later)
router.post('/recommend', recommendMovies);

router.get('/test', (req, res) => {
  res.send('✅ GPT test route is working');
});


export default router;
