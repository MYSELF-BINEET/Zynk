import mongoose, { Model, ObjectId, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


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
    posts:Array<{postId:ObjectId}>;
    videos:Array<{videoId:ObjectId}>;
    followers:Array<{userId:string}>;
    comparePassword:(password:string)=>Promise<boolean>;
    signAccessToken:()=>string;
    signRefreshToken:()=>string;
    isModified: (path: string) => boolean;
}


const userSchema:Schema<IUser>=new mongoose.Schema<IUser>({
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
        default:"Enter your bio ......"
    },
    privacy:{
        type:Boolean,
        default:false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    posts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Post',
        default:[]
    }],
    videos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video',
        default:[]
    }],
    followers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:[]
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