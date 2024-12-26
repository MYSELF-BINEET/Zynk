import mongoose, { Model, ObjectId, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import postModel, { IPost, postSchema } from "./post.model";
import reelsModel, { IReels, reelsSchema } from "./reels.model";
import ErrorHandler from "../utils/ErrorHandler";
import commentModel from "./comment.model";


const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document{
    name:string;
    email:string;
    password:string;
    avatar:{
        public_id:string,
        url:string
    };
    bio:string;
    privacy:boolean;
    isVerified:boolean;
    posts:IPost[];
    reels:IReels[];
    followersNumber:Number;
    followers:Array<ObjectId>;
    comparePassword:(password:string)=>Promise<boolean>;
    signAccessToken:()=>string;
    signRefreshToken:()=>string;
    isModified: (path: string) => boolean;
}


export const userSchema:Schema<IUser>=new mongoose.Schema<IUser>({
    name:{
        type:String,
        required:[true,'Please provide your name']
    },
    email:{
        type:String,
        required:[true,'Please provide your email'],
        validate:{
            validator:function(value:string){
                return emailRegexPattern.test(value);
            },
            message:'Please provide a valid email'
        },
        unique:true
    },
    password:{
        type:String,
        required:[true,'Please provide your password'],
        select:false
    },
    avatar:{
        public_id:String,
        url:String
    },
    bio:{
        type:String,
        // default:"Enter your bio ......"
    },
    privacy:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    posts:[postSchema],
    reels:[reelsSchema],
    followersNumber:{
        type:Number,
        default:0
    },
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{timestamps:true})




//Hash password before saving
userSchema.pre<IUser>("save",async function (next){
    // if(!this.isModified("password")){
    //     return next();
    // }
    this.password=await bcrypt.hash(this.password,10);
    next();
})

// Pre-delete middleware to delete associated posts and reels
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const user = this as unknown as IUser; // Reference the user being deleted

        // Delete all associated posts
        await postModel.deleteMany({ _id: { $in: user.posts } });

        // Delete all associated reels
        await reelsModel.deleteMany({ _id: { $in: user.reels } });

        const allComments = await postModel.aggregate([
            { $match: { _id: { $in: user.posts } } },  // Match posts by user
            { $unwind: "$comments" },  // Unwind the comments array
            { $project: { _id: "$comments._id" } }  // Project the comment _id
        ]);

        const commentIds = allComments.map((comment: any) => comment._id);  // Extract comment IDs

        // Delete comments by their _id
        await commentModel.deleteMany({ _id: { $in: commentIds } });

        next();
    } catch (error: any) {
        next(new ErrorHandler(error.message, 500));
    }
});

//sign access token
userSchema.methods.signAccessToken = function(){
    return jwt.sign({id:this._id},process.env.ACCESS_TOKEN || "",{
        expiresIn:"1h"
    });
};

//sign refresh token
userSchema.methods.signRefreshToken = function(){
    return jwt.sign({id:this._id},process.env.REFRESH_TOKEN || "",{
        expiresIn:"7d"
    });
};

//compare password
userSchema.methods.comparePassword =async function(
    enteredPassword:string
):Promise<boolean>{
    return await bcrypt.compare(enteredPassword, this.password);
};

const userModel : Model<IUser> =mongoose.model("User",userSchema);

export default userModel;