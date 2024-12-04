import mongoose, { Model, ObjectId, Schema } from "mongoose";


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
    messages:Array<{messageId:ObjectId}>,
    userId:ObjectId
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
            type:mongoose.Schema.Types.ObjectId,
            ref:'Message'
        }
    ],
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps:true});


const StatusModel:Model<IStatus>=mongoose.model<IStatus>('Status',statusSchema);

export default StatusModel;