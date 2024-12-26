import { Request } from "express";
import { IUser } from "../models/user.model";

declare global {
    namespace Express{
        interface Request{
            user?: IUser
        }
        interface Request {
            file?: Express.Multer.File; // Adds 'file' property to request object
          }
    }
}