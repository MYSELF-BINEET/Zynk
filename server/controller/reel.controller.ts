import { Request,Response,NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import getDataUri from "../utils/dataUri";
import jwt,{ JwtPayload } from "jsonwebtoken";
import userModel from "../model/user.model";
import cloudinary from "cloudinary";
import postModel from "../model/post.model";
import reelsModel from "../model/reels.model";
import commentModel from "../model/comment.model";



export const createReel=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const reel=req.file;

        const {description}=req.body;

        if(!description){
            return res.status(400).json({message:"Please enter a description"});
        }


        if(!reel){
            return next(new ErrorHandler("Please add a photo",400));
        }

        const pic=getDataUri(reel as any);


        if(!reel){
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
            resource_type:"video",
            folder:"zync/posts",
        });

        const uploadedReel=await postModel.create({
            userId:decoded.id,
            reel:{
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
            { $push: { reels: uploadedReel } }, 
            { new: true } 
        );

        return res.status(201).json({
            success:true,
            post:uploadedReel,
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

    const {reelId}=req.params;

    const {description}=req.body as IDescription;

    const reel=await reelsModel.findByIdAndUpdate(
        reelId,
        {description:description},
        {new:true}
    );

    const updatedUser = await userModel.findOneAndUpdate(
        { "reels._id": reelId }, // Find the user containing this post ID
        { $set: { "reels.$.description": description } }, // Update the description of the matching post
        { new: true } // Return the updated user document
    );


    return res.status(201).json({
        success:true,
        reel:reel,
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

        const { reelId }=req.params;

        const {action}=req.body as ILike;

        const counter = action === 'Like' ? 1 : -1;


          if (!reelId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
          }

      
          const updatedReel = await reelsModel.findByIdAndUpdate(
            reelId,
            { $inc: { likes: counter } }, // Increment the likes count by 1
            { new: true } // Return the updated document
          );
      
          if (!updatedReel) {
            return res.status(404).json({ success: false, message: "Post not found." });
          }

          const updatedUser = await userModel.findOneAndUpdate(
            { "reels._id": reelId }, // Find the user containing this post ID
            { $inc: { "reels.$.likes": counter } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );
      
          return res.status(200).json({
            success: true,
            message: "Reel liked successfully.",
            likes: updatedReel.likes,
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

        const { reelId }=req.params;


          if (!reelId) {
            return res.status(400).json({ success: false, message: "Post ID is required." });
          }
          
        
            const updatedReel = await reelsModel.findByIdAndUpdate(
                reelId,
                { $inc: { dislikes: counter } }, 
                { new: true } 
            );   
      
          if (!updatedReel) {
            return res.status(404).json({ success: false, message: "Post not found." });
          }

          const updatedUser = await userModel.findOneAndUpdate(
            { "reels._id": reelId }, // Find the user containing this post ID
            { $inc: { "reels.$.dislikes": counter } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );
      
      
          return res.status(200).json({
            success: true,
            message: "Post liked successfully.",
            dislikes: updatedReel.dislikes,
            user:updatedUser
          });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


export const createComment=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const { reelId }=req.params;
        const { comment }=req.body;

        if(!reelId){
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

        const updateReel = await postModel.findByIdAndUpdate(
            reelId, 
            { $push: { comments: commentCreate } }, 
            { new: true } 
        );

        const updatedUser = await userModel.findOneAndUpdate(
            { "reels._id": reelId }, // Find the user containing this post ID
            { $push: { "reels.$.comments": commentCreate } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );

        return res.status(201).json({
            success:true,
            reel:updateReel,
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

        
        const updateReel = await reelsModel.findOneAndUpdate(
            { "comments._id": commentId }, // Find the user containing this post ID
            { $push: { "comments.$.answer": {username:user?.name,answer:answer} } }, // Update the description of the matching post
            { new: true } // Return the updated user document
        );

        const updatedUser = await userModel.findOneAndUpdate(
            { "reels.comments._id": commentId }, // Find the user containing this post ID
            {
                $set: {
                    "reels.$[reel].comments.$[comment].answer": {
                        username: user?.name,
                        answer: answer,
                    },
                },
            }, // Update the specific comment's answer field
            {
                new: true, // Return the updated user document
                arrayFilters: [
                    { "reel.comments._id": commentId }, // Match the specific post
                    { "comment._id": commentId }, // Match the specific comment
                ],
            }
        );
        
        return res.status(201).json({
            success:true,
            reel:updateReel,
            user:updatedUser
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});


export const getAllReels=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {userId}=req.params;

        const reels=await reelsModel.find({userId:userId}).sort({createAt:-1});

        return res.status(201).json({
            success:true,
            reels:reels
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

        const reels=await reelsModel.find({userId:decoded.id}).sort({createAt:-1});

        return res.status(201).json({
            success:true,
            reels:reels
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


export const deleteReel=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const reelId=req.params;

        if(!refresh_token){
            return next(new ErrorHandler('Please login to delete post',401));
        }

        await reelsModel.deleteOne({ _id: reelId });

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully",
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})