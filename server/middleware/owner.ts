import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncError";
import jwt,{ JwtPayload } from "jsonwebtoken";
import ErrorHandler from "../utils/ErrorHandler";
import { updateAccessToken } from "../controller/user.controller";
import postModel from "../model/post.model";
import { isAuthenticated } from "./auth";

export const isOwner=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    const access_token=req.cookies.access_token as string;

    const {postId}=req.params;

    console.log(postId);

    const post=await postModel.findById(postId);


    console.log(post?.userId);

    
    if(!access_token){
        return next(new ErrorHandler("Please login the resources",400));
    }
    
    const decode=jwt.decode(access_token) as JwtPayload;
    
    if(!decode){
        return next(new ErrorHandler("Access Token is not defined",400));
    };

    console.log(decode.id);
    

    // if(decode.exp && decode.exp<=Date.now()/1000){
    //     await updateAccessToken(req,res,next);
    // }

    if (decode.id !== post?.userId.toString()) {
        return next(new ErrorHandler("You are not authorized to modify this post", 403));
    }

    next();
})