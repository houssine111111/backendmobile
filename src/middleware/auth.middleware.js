import jwt from 'jsonwebtoken';
import User from '../modules/User.js';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.user = await User.findById(decoded.id);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).send("Unauthorized");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
};
