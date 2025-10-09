import express from 'express';

import User from '../modules/User.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config'; 



const router = express.Router();

const generateToken = (userId) => {
  // Check if JWT_SECRET exists
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not defined!');
    throw new Error('JWT_SECRET is not configured');
  }
  
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
                 
               

};

router.post('/register', async (req, res) => {
  // Handle login
//   res.send('register route');
try {
    const { username,email, password } = req.body;

    // Basic validation
    if (!username || !password || username.trim() === '' || password.trim() === '' || !email) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    //check if user already exists
  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

//   if (existingUser) {
//     return res.status(400).json({ message: 'User already exists' });
//   }

// const existingEmail = await User.findOne({ email });
// if (existingEmail) {
//     return res.status(400).json({ message: 'Email already in use' });
// }

const existingUsername = await User.findOne({ username });
if (existingUsername) {
    return res.status(400).json({ message: 'Username already in use' });
}

    // Here you would typically check if the user already exists and hash the password
    // For simplicity, we'll skip those steps

    // Simulate user creation

    const profileImage = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`;
 

    const newUser = new User({ username, email, password, profileImage });
    // return newUser
    // In a real app, never store plain passwords
await newUser.save();
const token = generateToken(newUser._id);

res.status(201).json({ message: 'User registered successfully',user_id :newUser._id, token });
    // Respond with the created user (excluding the password in a real app)
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, username: newUser.username } });
  }catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Server error '+ error.message });
  }



});

router.post('/login', async (req, res) => {
  // Handle login
//   res.send('Login route');

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
    res.status(200).json({ message: 'Login successful', token });
} catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error ' + error.message });
}
});

export default router;
