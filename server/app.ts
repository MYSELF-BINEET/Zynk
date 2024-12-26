import express ,{Request,Response,NextFunction} from "express";
export const app=express();
import cors from 'cors';
import cookieParser = require("cookie-parser");
import userRouter from "./routes/user.route";
import messageRouter from "./routes/message.route";
import postRouter from "./routes/post.route";


//body parse
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));


//cookie-parser
app.use(cookieParser());

//cors use for frontend

app.use("/api/v1",userRouter);
app.use("/api/v1",messageRouter)
app.use("/api/v1",postRouter);

app.get("/test",(req : Request , res : Response,next:NextFunction)=>{
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