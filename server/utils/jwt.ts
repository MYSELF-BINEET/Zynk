require("dotenv").config();
import { NextFunction, Response } from "express";
import { IUser } from "../model/user.model";
import {redis} from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  // sameSite: "strict";
  // secure?: boolean;
}

// parse enviroment variables to integrates with fallback values
 const accessTokenExpire = parseInt(
  process.env.ACCESS_TOKEN_EXPIRE || "300",
  10
);
const refreshTokenExpire = parseInt(
  process.env.REFRESH_TOKEN_EXPIRE || "1200",
  10
);

// options for cookies
export const accessTokenOptions: ITokenOptions = {
  expires: new Date(Date.now() + accessTokenExpire * 60  * 60 * 1000),
  maxAge: accessTokenExpire * 60 * 60 * 1000,
  httpOnly: true,
  // sameSite: "strict",
  // secure: true,
};


export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    // sameSite: 'strict';
    // secure: true,
  };
  

  export const sendToken = (user:any, statusCode: number, res: Response) => {
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();
  
    // upload session to redis
    redis.set(user?._id, JSON.stringify(user) as any,);
  
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);
  
    res.status(statusCode).json({
      success: true,
      user,
      accessToken,
    });
  };
