import express from 'express';
import User from '../modules/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (userId) => {
  // Add error checking
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '1h' }
  );
};

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Basic validation
    if (!username || !password || !email || username.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already in use' });
      }
      return res.status(400).json({ message: 'Email already in use' });
    }
    
    // Create user
    const profileImage = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`;
    const newUser = new User({ username, email, password, profileImage });
    
    await newUser.save();
    
    // Generate token
    const token = generateToken(newUser._id);
    
    // Send response (only once!)
    res.status(201).json({ 
      message: 'User registered successfully',
      user_id: newUser._id, 
      token 
    });
    
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password || email.trim() === '' || password.trim() === '') {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(200).json({ 
      message: 'Login successful', 
      user_id: user._id,
      token 
    });
    
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

export default router;
