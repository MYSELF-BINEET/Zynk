import mongoose, {Model, ObjectId, Schema } from "mongoose";


export interface IPost extends Document{
    userId:ObjectId,
    public_id:string;
    url:string;
    description:string;
    likes:number;
    comments:Array<{commentId:ObjectId}>;
    shares:number;
}


const postSchema:Schema<IPost>=new mongoose.Schema<IPost>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    public_id:{
        type:String,
        required:true
    },
    url:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    likes:{
        type:Number,
        default:0
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    shares:{
        type:Number,
        default:0
    }
},{timestamps:true});


const postModel:Model<IPost>=mongoose.model<IPost>('Post',postSchema);

export default postModel;