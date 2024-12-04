import mongoose, {Document,Model,ObjectId,Schema}  from "mongoose";

export interface INotification extends Document{
   title: string;
   message: string;
   status: string;
   userId: ObjectId;
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
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
},{timestamps: true});


const NotificationModel: Model<INotification> = mongoose.model('Notification',notificationSchema);

export default NotificationModel;