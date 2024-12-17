import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt,{ JwtPayload } from "jsonwebtoken";
import cloudinary from "cloudinary"
import postModel from "../model/post.model";
import commentModel from "../model/comment.model";

interface IPost{
    photo:string;
    description:string;
}

export const createPost=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const {photo,description}=req.body as IPost;

        if(!photo){
            return next(new ErrorHandler("Please add a photo",400));
        }

        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resources",400));
        }

        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as JwtPayload;

        const myCloud=await cloudinary.v2.uploader.upload(photo,{
            folder:"posts",
        });

        const uploadedPhoto=await postModel.create({
            userId:decoded.id,
            photo:{
                public_id:myCloud.public_id,
                url:myCloud.secure_url,
            },
            description:description,
        });

        return res.status(201).json({
            success:true,
            data:uploadedPhoto,
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


export const likesUpdate=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const { postId }=req.params;

          if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
          }
      
          const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            { $inc: { likes: 1 } }, // Increment the likes count by 1
            { new: true } // Return the updated document
          );
      
          if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
          }
      
          return res.status(200).json({
            success: true,
            message: "Post liked successfully.",
            likes: updatedPost.likes,
          });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IComment{
    comment:string;
    postId:string;
}

export const createComment=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const { postId }=req.params;
        const { comment }=req.body;

        if(!postId){
            return res.status(400).json({
                success:false,
                message:"Post ID is required"
            })
        };

        const refresh_token=req.cookies.refresh_token as string;

        const decoded=jwt.verify(
            refresh_token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        const commentCreate=await commentModel.create({
            userId:decoded.id,
            postId:postId,
            comment:comment
        });

        const post=await postModel.findByIdAndUpdate(postId,{comments:commentCreate._id},{new:true});

        return res.status(201).json({
            success:true,
            post
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});


export const addReply=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // const { postId }=req.params;
        const { answer }=req.body;
        const { commentId }=req.params;

        
        const refresh_token=req.cookies.refresh_token as string;
        
        const decoded=jwt.verify(
            refresh_token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;
        

        const answerCreate=await commentModel.create({
            userId:decoded.id,
            question:answer
        });

        
        const comment=await commentModel.findByIdAndUpdate(commentId,{answer:answerCreate._id},{new:true});

        return res.status(201).json({
            success:true,
            comment
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});


export const getAllPosts=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {userId}=req.params;

        const posts=await postModel.find({userId:userId}).sort({createAt:-1});

        return res.status(201).json({
            success:true,
            posts
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});



export const getOwnPosts=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;
        
        const decoded=jwt.verify(
            refresh_token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        const posts=await postModel.find({userId:decoded.id}).sort({createAt:-1});

        return res.status(201).json({
            success:true,
            posts
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


/// share option yet to create
