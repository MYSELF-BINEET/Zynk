import mongoose, {Document,Model,ObjectId,Schema}  from "mongoose";
import { IUser, userSchema } from "./user.model";

export interface INotification extends Document{
   title: string;
   message: string;
   status: string;
   userId: String;
}

const notificationSchema = new Schema<INotification>({
    title:{
        type: String,
        required: true
    },
    message:{
        type:String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: "unread"
    },
    // userId:{
    //     type: String,
    //     required: true
    // },    
},{timestamps: true});


const NotificationModel: Model<INotification> = mongoose.model('Notification',notificationSchema);

export default NotificationModel;