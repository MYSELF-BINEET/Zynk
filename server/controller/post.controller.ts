require('dotenv').config();
import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt,{ JwtPayload } from "jsonwebtoken";
import cloudinary from "cloudinary"
import postModel from "../model/post.model";
import commentModel from "../model/comment.model";
import getDataUri from "../utils/dataUri";
import userModel from "../model/user.model";
import { isOwner } from "../middleware/owner";

interface IPost{
    description:string;
    photo:File;
}

//tested
export const createPost=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const photo=req.file;

        const {description}=req.body;

        if(!description){
            return res.status(400).json({message:"Please enter a description"});
        }


        if(!photo){
            return next(new ErrorHandler("Please add a photo",400));
        }

        const pic=getDataUri(photo as any);


        if(!photo){
            return next(new ErrorHandler("Please add a photo",400));
        }

        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resources",400));
        }

        if (!process.env.REFRESH_TOKEN) {
            return next(new ErrorHandler("JWT secret key not configured", 500));
        }

        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;


        const myCloud=await cloudinary.v2.uploader.upload(pic.content as string,{
            folder:"zync/posts",
        });

        const uploadedPhoto=await postModel.create({
            userId:decoded.id,
            photo:{
                public_id:myCloud.public_id,
                url:myCloud.secure_url,
            },
            description:description
        });

        // if (!decoded.id) {
        //     return next(new ErrorHandler("Decoded id not found",400));
        // }

        // const user=await userModel.findById(decoded.id);

        // if (!user) {
        //     return next(new ErrorHandler("user not found",400));
        // }

        // user?.posts.push(uploadedPhoto);

        // try {
        //     await user.save();
        // } catch (err) {
        //     console.error('Error saving user:', err);
        //     throw new Error('Failed to save user');
        // }

        const updatedUser = await userModel.findByIdAndUpdate(
            decoded.id, 
            { $push: { posts: uploadedPhoto } }, 
            { new: true } 
        );

        return res.status(201).json({
            success:true,
            post:uploadedPhoto,
            data:updatedUser,
            message:"Photo uploaded successfully",
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IDescription{
    description:string;
}

//tested
export const updateDescription=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
   try{

    const {postId}=req.params;

    const {description}=req.body as IDescription;

    const post=await postModel.findByIdAndUpdate(
        postId,
        {description:description},
        {new:true}
    );

    const updatedUser = await userModel.findOneAndUpdate(
        { "posts._id": postId }, // Find the user containing this post ID
        { $set: { "posts.$.description": description } }, // Update the description of the matching post
        { new: true } // Return the updated user document
    );


    return res.status(201).json({
        success:true,
        post:post,
        user:updatedUser,
        message:"Update description successfully"
    })
   }catch(error:any){
      next(new ErrorHandler(error.message,401));
   } 
})

interface ILike{
    action:string;
}

//tested
export const likesUpdate=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // const refresh_token=req.cookies.refresh_token as string;

        const { postId }=req.params;

        const {action}=req.body as ILike;

        const counter = action === 'Like' ? 1 : -1;


          if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
          }

      
          const updatedPost = await postModel.findByIdAndUpdate(
            postId,
            { $inc: { likes: counter } }, // Increment the likes count by 1
            { new: true } // Return the updated document
          );
      
          if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
          }

          const updatedUser = await userModel.findOneAndUpdate(
            { "posts._id": postId }, // Find the user containing this post ID
            { $inc: { "posts.$.likes": counter } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );
      
          return res.status(200).json({
            success: true,
            message: "Post liked successfully.",
            likes: updatedPost.likes,
            user:updatedUser,
          });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IDislike{
    action:string
}

//tested
export const dislikesUpdate=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // const refresh_token=req.cookies.refresh_token as string;

        const {action}=req.body as IDislike;

        const counter = action === 'Dislike' ? 1 : -1;

        const { postId }=req.params;


          if (!postId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
          }
          
        
            const updatedPost = await postModel.findByIdAndUpdate(
                postId,
                { $inc: { dislikes: counter } }, 
                { new: true } 
            );   
      
          if (!updatedPost) {
            return res.status(404).json({ success: false, message: "Post not found." });
          }

          const updatedUser = await userModel.findOneAndUpdate(
            { "posts._id": postId }, // Find the user containing this post ID
            { $inc: { "posts.$.dislikes": counter } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );
      
      
          return res.status(200).json({
            success: true,
            message: "Post liked successfully.",
            dislikes: updatedPost.dislikes,
            user:updatedUser
          });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IComment{
    comment:string;
    postId:string;
}

//tested
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
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const commentCreate=await commentModel.create({
            userId:decoded.id,
            comment:comment
        });

        const updatePost = await postModel.findByIdAndUpdate(
            postId, 
            { $push: { comments: commentCreate } }, 
            { new: true } 
        );

        const updatedUser = await userModel.findOneAndUpdate(
            { "posts._id": postId }, // Find the user containing this post ID
            { $push: { "posts.$.comments": commentCreate } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );

        return res.status(201).json({
            success:true,
            post:updatePost,
            user:updatedUser
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});



//tested
export const addReply=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // const { postId }=req.params;
        const { answer }=req.body;
        const { commentId }=req.params;

        
        const refresh_token=req.cookies.refresh_token as string;
        
        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const user=await userModel.findById(decoded.id);
        

        // const answerCreate=await commentModel.create({
        //     userId:decoded.id,
        //     comment:answer
        // });

        
        const updatePost = await postModel.findOneAndUpdate(
            { "comments._id": commentId }, // Find the user containing this post ID
            { $push: { "comments.$.answer": {username:user?.name,answer:answer} } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );

        const updatedUser = await userModel.findOneAndUpdate(
            { "posts.comments._id": commentId }, // Find the user containing this post ID
            {
                $set: {
                    "posts.$[post].comments.$[comment].answer": {
                        username: user?.name,
                        answer: answer,
                    },
                },
            }, // Update the specific comment's answer field
            {
                new: true, // Return the updated user document
                arrayFilters: [
                    { "post.comments._id": commentId }, // Match the specific post
                    { "comment._id": commentId }, // Match the specific comment
                ],
            }
        );
        
        return res.status(201).json({
            success:true,
            post:updatePost,
            user:updatedUser
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
            process.env.REFRESH_TOKEN as string
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


export const deletePost=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const postId=req.params;

        if(!refresh_token){
            return next(new ErrorHandler('Please login to delete post',401));
        }

        await postModel.deleteOne({ _id: postId });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

/// share option yet to create
