export const saveFeedback = async (req, res) => {
  try {
    const { userId, movieId, feedbackType, value } = req.body;

    if (!movieId || !feedbackType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const feedback = {
      userId: userId || 'guest',
      movieId,
      feedbackType,
      value,
      timestamp: new Date(),
    };

    // For now, just log or push to an in-memory array or file (or connect to MongoDB)
    console.log('📥 Feedback received:', feedback);

    res.status(200).json({ message: 'Feedback saved' });
  } catch (err) {
    console.error('❌ Feedback save error:', err.message);
    res.status(500).json({ error: 'Failed to save feedback' });
  }
};
