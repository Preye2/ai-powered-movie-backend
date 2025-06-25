// backend/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware to protect routes (JWT verification)
const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Proceed to next middleware or route handler
      next();
    } catch (err) {
      console.error('❌ JWT Auth error:', err.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    // If no token is present
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export default protect;
