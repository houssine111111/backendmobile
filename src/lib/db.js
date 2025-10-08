
// const mongoose = require('mongoose');
import { mongoose } from 'mongoose';



export const connectDB=  async () => {

    try{

        const conn= await    mongoose.connect("mongodb://127.0.0.1:27018/books")
    
          console.log("Connected successfully to MongoDB "+conn.connection.host);
     
     


    } catch(error){
console.log("Error with connection to the database", error);
process.exit(1)

    }   

  
  };


export default connectDB