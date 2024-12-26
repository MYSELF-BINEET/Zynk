require('dotenv').config()
import { v2 as cloudinary } from "cloudinary";


const connectV2=async()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.CLOUD_API_KEY,
            api_secret:process.env.CLOUD_SECRET_KEY
        })
        console.log("Cloudinary connected");
    } catch (error) {
        console.log("Cloudinary connection failed");
    }
}



export default connectV2;
