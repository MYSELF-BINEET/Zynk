import mongoose, { Model, ObjectId, Schema } from "mongoose";
import commentModel, { commentSchema, IComment } from "./comment.model";
import { IUser, userSchema } from "./user.model";
import ErrorHandler from "../utils/ErrorHandler";



export interface IReels extends Document{
    userId:string;
    description: string;
    reel:{
        public_id:string;
        url:string;
    };    
    views: number;
    likes: number;
    dislikes: number;
    comments: IComment[];
    shares:number;
    // times:number;
}



export const reelsSchema:Schema<IReels>=new Schema<IReels>({
    userId:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    reel:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        },
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
        type:commentSchema,
        default:[],
    }],
    shares:{
        type:Number,
        default:0
    },
    // times:{
    //     type:Number,
    //     default:5,
    //     max:10
    // }
},{timestamps:true});

reelsSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    try {
        const reel = this as unknown as IReels; // Reference the document being deleted
        await commentModel.deleteMany({ _id: { $in: reel.comments } }); // Delete associated comments
        next();
    } catch (error:any) {
        next(new ErrorHandler(error.message,400));
    }
});

const reelsModel:Model<IReels>=mongoose.model('Reels',reelsSchema);

export default reelsModel;