import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface IFollower extends Document {
    user_id: ObjectId;
    follower_id: ObjectId;
    following_id: ObjectId;
    notification_type: string;
    message: string;
    status: boolean;
}

export interface IFollowerModel extends IFollower, Document {

}

const FollowerSchema: Schema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    follower_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    following_id: {
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
})