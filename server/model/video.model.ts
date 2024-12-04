import mongoose, { Model, ObjectId, Schema } from "mongoose";



export interface IVideo extends Document{
    userId:ObjectId;
    title: string;
    description: string;
    public_id:string;
    url:string;
    views: number;
    likes: number;
    dislikes: number;
    comments: Array<{commentId:ObjectId}>;
    shares:number;
    times:number;
}



const videoSchema:Schema<IVideo>=new Schema<IVideo>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
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
    views:{
        type:Number,
        default:0
    },
    likes:{
        type:Number,
        default:0
    },
    dislikes:{
        type:Number,
        default:0
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Comment"
    }],
    shares:{
        type:Number,
        default:0
    },
    times:{
        type:Number,
        default:5,
        max:10
    }
},{timestamps:true});

const videoModel:Model<IVideo>=mongoose.model('Video',videoSchema);

export default videoModel;