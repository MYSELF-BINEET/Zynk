import mongoose, { Model, ObjectId, Schema } from "mongoose";



export interface IComment extends Document{
    userId:ObjectId;
    photoId:ObjectId
    videoId:ObjectId
    question:string;
    answer:IComment[];
};


const commentSchema:Schema<IComment> = new mongoose.Schema<IComment>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    photoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Photo"
    },
    videoId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    question:{
        type:String,
        required:true
    },
    answer:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Comment"
        }
    ]
},{timestamps:true});

const commentModel:Model<IComment> = mongoose.model('Comment',commentSchema);

export default commentModel;
