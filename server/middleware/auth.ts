import { NextFunction,Request,Response } from "express";
import { CatchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt,{ JwtPayload } from "jsonwebtoken";
import { updateAccessToken } from "../controller/user.controller";


export const isAuthenticated=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    const access_token=req.cookies.access_token as string;

    if(!access_token){
        return next(new ErrorHandler("Please login the resources",400));
    }

    const decode=jwt.decode(access_token) as JwtPayload;

    if(!decode){
        return next(new ErrorHandler("Access Token is not defined",400));
    };

    if(decode.exp && decode.exp<=Date.now()/1000){
        await updateAccessToken(req,res,next);
    }

    next();
})