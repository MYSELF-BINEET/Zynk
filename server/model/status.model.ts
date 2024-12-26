import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { IMessage, messageSchema } from "./message.model";
import { IUser, userSchema } from "./user.model";


export interface IStatus{
    title:string,
    description:string,
    photo:{
        public_id:string,
        url:string,
    },
    video:{
        public_id:string,
        url:string,
    },
    messages:IMessage,
    user:String
}


const statusSchema:Schema<IStatus>=new mongoose.Schema<IStatus>({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    photo:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    video:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    messages:[
        {
            type:messageSchema,
            default:[]
        }
    ],
    user:{
        type:String,
        required:true
    }
},{timestamps:true});


const StatusModel:Model<IStatus>=mongoose.model<IStatus>('Status',statusSchema);

export default StatusModel;