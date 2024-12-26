import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { IUser, userSchema } from "./user.model";


export interface IMessage{
    from:String;
    to:String;
    message:String;
    status:String;
}

export const messageSchema:Schema<IMessage>=new mongoose.Schema<IMessage>({
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    status:{
        type:String,
        enum:["pending","seen","delivered"],
        required:true,
        default:"delivered"
    }
},{timestamps:true});


const messageModel:Model<IMessage> =mongoose.model('Message',messageSchema);

export default messageModel;