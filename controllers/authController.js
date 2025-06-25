import bcrypt from 'bcrypt';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import generateToken from '../utils/generateToken.js';

// ✅ Register user (no manual hashing here)
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // ❌ Don't hash here — Mongoose pre-save will do it
    const user = await User.create({ username, email, password });

    // Return JWT + user info
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// ✅ Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔐 Login attempt:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match?', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
