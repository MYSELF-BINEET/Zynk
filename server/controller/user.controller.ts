import { Request,Response,NextFunction } from "express"
import { CatchAsyncError } from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import userModel, { IUser } from "../model/user.model";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/nodeMailer";
import ejs from "ejs";
import path from "path";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import {redis} from "../utils/redis";
import bcrypt from "bcryptjs";
import { getAllUsersService } from "../services/user.service";
import cloudinary from "cloudinary"

interface IRegistrationBody{
    name:string;
    email:string;
    password:string;
    avatar?:string;
};


export const registrationUser=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {name,email,password}=req.body as unknown as IRegistrationBody;
        const isEmailExists=await userModel.findOne({email});
        if(isEmailExists){
            return next(new ErrorHandler("Email already in user",400));
        }
        
        const user:IRegistrationBody={
            name,
            email,
            password,
        };

        const activationToken=createActivationToken(user);

        const activationCode=activationToken.activationCode;

        const data={user:{name:user.name},activationCode};

        // const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);


        try{
            await sendMail({
                email:user.email,
                subject:"Activation your account",
                template:"activation-mail.ejs",
                data
            });

           res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email} to activate your account!`,
                activationToken: activationToken.token,
                activationCode:activationToken.activationCode
           });
            
        }catch(error:any){
            return next(new ErrorHandler("Error to send email",400));
        }

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});

interface IActivationToken{
    activationCode:string;
    token:string;
};

export const createActivationToken = (user: any): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

    const token = jwt.sign(
        {
          user,
          activationCode,
        },
        process.env.ACTIVATION_SECRET as Secret,
        {
          expiresIn: "10m",
        }
      );
    return {token,activationCode} ;
}


interface IActivationRequest{
    activationToken:String;
    activationCode:String;
}

export const activeUser=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {activationToken,activationCode}=req.body as IActivationRequest;

        const newUser:{user:IUser,activationCode:String}=jwt.verify(activationToken as string,process.env.ACTIVATION_SECRET as string) as {user:IUser,activationCode:String};

        if(newUser.activationCode!==activationCode){
            return next(new ErrorHandler("Invalid activation code",400));
        };

        const {name,email,password}=newUser.user;

        const exitsUser=await userModel.findOne({email});

        if(exitsUser){
            return next(new ErrorHandler("User already exists",400));
        }

        const user=await userModel.create({
            name,
            email,
            password,
        });

        return res.status(201).json({
            success:true,
            user,
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,4000));
    }
});


interface ILoginRequest{
    email:string;
    password:string;
}


export const loginUser=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const {email,password}=req.body as ILoginRequest;
        if(!email || !password){
            return next(new ErrorHandler("Please provide both email and password",400));
        }
        const user=await userModel.findOne({email}).select("+password");

        if(!user){
            return next(new ErrorHandler("Invalid email or password",401));
        };

        // const isPasswordMatch=user.comparePassword(password);
        const isPasswordMatch=await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return next(new ErrorHandler("Invalid email or password",401));
        }

        sendToken(user,200,res);
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});


export const logoutUser=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        res.cookie("access_token","",{maxAge:0});
        res.cookie("refresh_token","",{maxAge:0});
    
        const userId=req.user?._id || "";
        redis.del(userId);
    
        res.status(200).json({
            success:true,
            message:"Logged out successfully",
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

export const updateAccessToken=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;
        if(!refresh_token){
            return next(new ErrorHandler("Please provide a refresh token",401));
        }

        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const message = "Could not refresh token";
        if (!decoded) {
          return next(new ErrorHandler(message, 400));
        }
        
        const session=await redis.get(decoded.id);

        
        if (!session) {
            return next(
              new ErrorHandler("Please login for access this resources!!!!!", 400)
            );
        };

        const user=JSON.parse(session as any);

        const accessToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN as string,
            {
              expiresIn: "5m",
            }
          );
    
          const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN as string,
            {
              expiresIn: "3d",
            }
          );
          await redis.set(user._id, JSON.stringify(user)); // 7days
  
    
        //   req.user = user;
    
          res.cookie("access_token", accessToken, accessTokenOptions);
          res.cookie("refresh_token", refreshToken, refreshTokenOptions);
    
  
          return res.status(200).json({
            success: true,
            accessToken
          })
    
        next();

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});

export const getUserInfo=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        // const userId=req?.user?._id;
        // console.log(userId);
        const refreshToken=req.cookies.refresh_token;

        if(!refreshToken){
            return next(new ErrorHandler("Please login for access this resources!!!!!", 400))
        }

        const decoded=jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const userId=decoded.id;

        const user=await userModel.findOne({_id:userId});
    
        if(user){
            // const userInfo=JSON.parse(user as any);
            return res.status(200).json({
                success:true,
                user:user
            })
        }else{
            return res.status(400).json({
                success:false,
                message:"User not found"
            })
        }
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IUpdatePassword{
    oldPassword:string;
    newPassword:string;
}

export const updatePassword=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refreshToken=req.cookies.refresh_token as string;
        if(!refreshToken){
            return next(new ErrorHandler("Please login for access this resources!!!!!", 400))
        };
    
        const { oldPassword,newPassword }=req.body as IUpdatePassword;
    
        if(oldPassword===newPassword){
            return next(new ErrorHandler("Old password and new password can't be same",400))
        }

        if(oldPassword==undefined || newPassword==undefined){
            return next(new ErrorHandler("User password is not defined",400))
        };
    
    
        const decoded=jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;

        const session=await redis.get(decoded.id);

        // console.log(session);

        const redisUser=JSON.parse(session as any);

        const email=redisUser.email;
    
        const user = await userModel.findOne({email}).select("+password");

        // console.log(user);
    
       
        // const isPasswordMatch=user?.comparePassword(oldPassword);
        if(user){
            await bcrypt.compare(oldPassword,user.password)
        }
        else{
            return next(new ErrorHandler("Old password is not correct",400))
        };
    
        if (user) {
            user.password = newPassword;
        } else {
            return next(new ErrorHandler("User not found", 404));
        }
        
        await user?.save();

        await userModel.findByIdAndUpdate(decoded.id,user as IUser);
    
        await redis.set(decoded.id, JSON.stringify(user));
    
          res.status(201).json({
            success: true,
            user,
        });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }

});


export const getAllUsers=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        getAllUsersService(res);
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})

interface IProfilePicture{
    avatar:string;
}

export const updateProfilePicture=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const {avatar}=req.body as IProfilePicture;
    
        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resource",400));
        }
    
        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;
    
        const user=await userModel.findById(decoded.id);
    
        if (avatar && user) {

            if (user?.avatar?.public_id) {

              await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
    
              const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
              });
              user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              };
            } else {
              const myCloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "avatars",
                width: 150,
              });
              user.avatar = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
              };
            }
          }
          
          await user?.save();

          const updateUser=await userModel.findByIdAndUpdate(decoded.id,user as IUser);
    
          await redis.set(decoded.id, JSON.stringify(user));
        
              res.status(201).json({
                success: true,
                user:updateUser,
            });
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});

interface IBio{
    bio:string;
}

export const updateBio=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const {bio}=req.body as IBio;

        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resource",400));
        }
    
        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;
    
        // const user=await userModel.findById(decoded.id);

        // if(user){
        //     user.bio=bio;
        // }else{
        //     return next(new ErrorHandler("User not found",404));
        // }

        // console.log(user);
        

        // try {
        //     await user?.save();
        //     console.log("User saved successfully!");
        // } catch (error: any) {
        //     console.error("Error saving user:", error.message);
        // }

        // await user?.save();
        
        
        const updateUser=await userModel.findByIdAndUpdate(decoded.id,{bio:bio},{new:true});


        await redis.set(decoded.id, JSON.stringify(updateUser));

        return res.status(201).json({
            success:true,
            user:updateUser,
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


interface IPrivate{
    isPrivate:boolean;
}

export const updatePrivacy=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

        const {isPrivate}=req.body as IPrivate;
    
        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resource",400));
        }
    
        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;
    
        // const user=await userModel.findById(decoded.id);

        // if(isPrivate){
        //     user!.privacy=isPrivate;
        // }

        // try {
        //     await user?.save();
        //     console.log("User saved successfully!");
        // } catch (error: any) {
        //     console.error("Error saving user:", error.message);
        // }

        const updateUser=await userModel.findByIdAndUpdate(decoded.id,{privacy:isPrivate},{new:true});

        await redis.set(decoded.id, JSON.stringify(updateUser));

        return res.status(201).json({
            success:true,
            user:updateUser,
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
});

interface IVerified{
    isVerified:boolean;
}

export const updateIsVerified=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refreshToken=req.cookies.refresh_token as string;

        const {isVerified}=req.body as IVerified;

        if(!refreshToken){
            return next(new ErrorHandler("Please Login to get resource",400));
        }

        const decoded=jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;


        // const user=await userModel.findById(decoded.id);

        // if(isVerified){
        //     user!.isVerified=isVerified;
        // }

        // try {
        //     await user?.save();
        //     console.log("User saved successfully!");
        // } catch (error: any) {
        //     console.error("Error saving user:", error.message);
        // }

        const updateUser=await userModel.findByIdAndUpdate(decoded.id,{isVerified:isVerified},{new:true});

        await redis.set(decoded.id, JSON.stringify(updateUser));

        return res.status(201).json({
            success:true,
            user:updateUser,
        })

    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})


export const deleteUser=CatchAsyncError(async(req:Request,res:Response,next:NextFunction)=>{
    try{
        const refresh_token=req.cookies.refresh_token as string;

    
        if(!refresh_token){
            return next(new ErrorHandler("Please Login to get resource",400));
        }
    
        const decoded=jwt.verify(
            refresh_token,
            process.env.REFRESH_TOKEN as string
        ) as JwtPayload;
    
        await userModel.findByIdAndDelete(decoded.id);

        return res.status(201).json({
            success:true,
            message:"Delete Successfully"
        })
    }catch(error:any){
        return next(new ErrorHandler(error.message,400));
    }
})