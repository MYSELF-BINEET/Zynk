import { Response } from "express";
import userModel from "../model/user.model";

// Get All users
export const getAllUsersService = async (res: Response) => {
    const users = await userModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      users,
    });
  };