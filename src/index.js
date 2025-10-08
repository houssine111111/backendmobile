// const express = require('express');
import 'dotenv/config';


import express from 'express';
import cors from 'cors';

import authRoutes from "./routes/authRoutes.js"
import bookRoutes from "./routes/bookRoutes.js"
import { connectDB } from './lib/db.js';
import { use } from 'react';

const app = express();
app.use(express.json());
app.use(cors()); 

console.log('🔍 Environment check:');
console.log('JWT_SECRET loaded?', !!process.env.JWT_SECRET);
console.log('JWT_SECRET value:', process.env.JWT_SECRET);
console.log('MONGODB_URI loaded?', !!process.env.MONGODB_URI);

const PORT = process.env.PORT || 5000;


app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB()
});
 
