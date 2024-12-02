require('dotenv').config()
import { v2 as cloudinary } from "cloudinary";


const connectV2=async()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUDINARY_NAME,
            api_key:process.env.CLOUDINARY_API_KEY,
            api_secret:process.env.CLOUDINARY_API_SECRET
        })
        console.log("Cloudinary connected")
    } catch (error) {
        console.log("Cloudinary connection failed");
    }
}



export default connectV2;
