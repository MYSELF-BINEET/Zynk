import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { IUser, userSchema } from "./user.model";



export interface IComment extends Document{
    userId:String;
    // photoId:ObjectId
    // reelsId:ObjectId
    comment:string;
    answer:[];
};


export const commentSchema:Schema<IComment> = new mongoose.Schema<IComment>({
    userId:{
        type:String,
        required:true
    },
    // photoId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Photo"
    // },
    // reelsId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Reels"
    // },
    comment:{
        type:String,
        required:true
    },
    answer:[
        {
            username:String,
            answer:String,
        }
    ]
},{timestamps:true});


const commentModel:Model<IComment> = mongoose.model('Comment',commentSchema);

export default commentModel;
