import mongoose, { Model, ObjectId, Schema } from "mongoose";


export interface IMessage{
    from:ObjectId;
    to:ObjectId;
    message:String;
    status:String;
}

const messageSchema:Schema<IMessage>=new mongoose.Schema<IMessage>({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
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