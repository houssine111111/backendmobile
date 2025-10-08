
// const mongoose = require('mongoose');
import { mongoose } from 'mongoose';



export const connectDB=  async () => {

    try{

             const conn= await    mongoose.connect("mongodb+srv://abdoulahlou12345_db_user:<db_password>@cluster0.ldicje0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    
          console.log("Connected successfully to MongoDB "+conn.connection.host);
     
     


    } catch(error){
console.log("Error with connection to the database", error);
process.exit(1)

    }   

  
  };


export default connectDB
