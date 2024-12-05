import { Request,Response,NextFunction } from "express"
import { CatchAsyncError } from "../middleware/catchAsyncError"
import ErrorHandler from "../utils/ErrorHandler"
import userModel from "../model/user.model";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import sendMail from "../utils/nodeMailer";
import ejs from "ejs";
import path from "path";

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

        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data);


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






