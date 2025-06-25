import express from 'express';
import { saveFeedback } from '../controllers/feedbackController.js';

const router = express.Router();
router.post('/', saveFeedback);

export default router;
