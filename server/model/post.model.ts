import mongoose, {Model, ObjectId, Schema } from "mongoose";
import ErrorHandler from "../utils/ErrorHandler";
import { IUser, userSchema } from "./user.model";
import commentModel, { commentSchema, IComment } from "./comment.model";


export interface IPost extends Document{
    userId:string,
    photo:{
        public_id:string,
        url:string
    };
    description:string;
    likes:Number;
    dislikes:number;
    comments:IComment[];
    shares:number;
}


export const postSchema:Schema<IPost>=new mongoose.Schema<IPost>({
    userId:String,
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
    description:{
        type:String,
        // required:true,
        // default:"Sample testing"
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
        type:commentSchema,
        default:[]
    }],
    shares:{
        type:Number,
        default:0
    }
},{timestamps:true});

postSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const post = this as unknown as IPost; // Reference the document being deleted
        await commentModel.deleteMany({ _id: { $in: post.comments } }); // Delete associated comments
        next();
    } catch (error:any) {
        next(new ErrorHandler(error.message,400));
    }
});
const postModel:Model<IPost>=mongoose.model<IPost>('Post',postSchema);

export default postModel;