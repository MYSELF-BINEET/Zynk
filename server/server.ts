import { app } from "./app";
import http from "http";
import connectDb from "./utils/db";
import connectV2 from "./utils/cloudinary";
require('dotenv').config()


const server=http.createServer(app);


server.listen(process.env.PORT,()=>{
    console.log(`Server is running on port no : ${process.env.PORT}`);
    connectDb();
    connectV2();
})