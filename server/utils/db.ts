import mongoose from "mongoose";
require('dotenv').config()


const dbUrl=process.env.MONGO_URL || "";

const connectDb=async()=>{
    try{
        await mongoose.connect(dbUrl).then((data:any)=>{
            console.log(`Database connection to MongoDB : ${data.connection.host}`)
        })
    }catch(error:any){
        console.log(error);
        setTimeout(connectDb,5000);
    }
}

export default connectDb;