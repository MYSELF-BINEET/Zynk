require('dotenv').config();
import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { IUser } from "../model/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import messageModel from "../model/message.model";
import { ObjectId } from "mongoose";


interface IMessage{
    from:ObjectId;
    to:ObjectId;
    message:string;
};

export const sendMessage=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {from,to,message}=req.body as IMessage;

        if(!from || !to || !message){
            return next(new ErrorHandler('Please fill all fields',400));
        };

        const newMessage=await messageModel.create({
            from,
            to,
            message
        });

        res.status(201).json({
            success:true,
            message:newMessage
        });
    }catch(error:any){
        next(new ErrorHandler(error.message,400));
    }
});

interface ISortMessage{
    from:string;
    to:string;
}

export const getMessage=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {from,to}=req.body as ISortMessage;

        const messages = await messageModel
                .find(
                    {
                        $or: [
                            { from: from, to: to }, // Messages from -> to
                            { from: to, to: from }  // Messages to -> from
                        ]
                    }, // Query: find documents matching "from" and "to"
                    { message: 1, from: 1, to: 1, createdAt: 1 } // Projection: include these fields
                )
                .sort({ createdAt: 1 });

        return res.status(201).json({
            success:true,
            messages
        })
    }catch(error:any){
        next(new ErrorHandler(error.message,400));
    }
})