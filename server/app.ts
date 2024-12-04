import express ,{Request,Response,NextFunction} from "express";
export const app=express();
import cors from 'cors';
import cookieParser = require("cookie-parser");


//body parse
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));


//cookie-parser
app.use(cookieParser());

//cors use for frontend



app.get("/test",(req : Request , res : Response , next : NextFunction)=>{
    res.status(200).json({
        message:"Test route is tested",
        success:true
    })
})


app.all("*",(req:Request,res:Response,next:NextFunction)=>{
    const err=new Error(`Route ${req.originalUrl} not found`) as any;
    err.status=404;
    next(err);
})


//Error middleware