import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import userModel from "../model/user.model";

export const isPrivate=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{

    const {userId}=req.params;


    const user=await userModel.findById(userId);

    if(user?.privacy==true){
        return next(new ErrorHandler("Permission Denied",400));
    }

    next();
})