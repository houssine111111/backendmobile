import express from 'express';
import Book from '../modules/Book.js';
import jwt from 'jsonwebtoken';
import cloudinary from '../lib/cloudinary.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router =express.Router()

//create
router.post("/",protectRoute,async(req,res)=>{
  try {
    const {title,caption,rating,image}=req.body
    if(!title || !caption || !rating || !image){
      return res.status(400).send("all fields are required")
    }

   

//upload image to cloudinary
const uploadResponse = await cloudinary.uploader.upload(image);
const imageUrl = uploadResponse.secure_url;
    console.log(imageUrl)
       if (!imageUrl) {
      return res.status(500).send("Image upload failed");
    }
   console.log("Image uploaded to Cloudinary:", imageUrl);
//save document to database
const newBook = new Book({ title, caption, rating, image: imageUrl, user: req.user._id });
await newBook.save();
res.status(201).send("book created")
res.json(newBook)
  } catch (error) {
  console.error("Error creating book:", error); // Log the full error in server console
    res.status(500).json({
      message: error.message || "Server error while creating book",
    });
  } 
})

//fetch all books
router.get("/",protectRoute,async(req,res)=>{
  try {

    //pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find().sort({ createdAt: -1 }) //descending order
    .populate("user", "username profileImage").skip(skip).limit(limit);
    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);
    res.json({ books, totalBooks, totalPages });
  } catch (error) {
    res.status(500).send("server error" + error.message)
  }
})

//delete
router.delete("/:id",protectRoute,async(req,res)=>{
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).send("book not found");
    }
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("forbidden");
    }
   
//if you want to delete image from cloudinary
 if (book.image && book.image.includes('&cloudinary')) {
      try {
        const publicId = book.image.split('/').pop().split('.')[0]; // Extract public ID from URL
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }
 // await book.remove();
    await book.deleteOne();
    res.send("book deleted");
  } catch (error) {
    res.status(500).send("server error");
  }
});

//get recommended books
router.get("/user",protectRoute,async(req,res)=>{
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 })
    res.json(books);
  } catch (error) {
    res.status(500).send("server error" + error.message)
  }
})




export default router;
