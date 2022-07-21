import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface INotification extends Document {
    sender_id: ObjectId;
    receiver_id: ObjectId;
    notification_type: string;
    message: string;
    status: boolean;
}

export interface INotificationModel extends INotification, Document {

}

const NotificationSchema: Schema = new Schema(
    {
        sender_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        receiver_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        notification_type: {
            type: String
        },
        message: {
            type: String
        },
        status: {
            type: Boolean,
            default: true
        },
    }
)

export default mongoose.model<INotification>('Notification', NotificationSchema)