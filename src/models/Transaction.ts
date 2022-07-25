import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface ITransaction extends Document {
    userId: ObjectId;
    ideaId: ObjectId;
    title: string,
    types: string,
    point: number;
    rewardPoint: number;
}

const TransactionSchema = new Schema<ITransaction>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        ideaId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Idea'
        },
        title: {
            type: String
        },
        types: {
            type: String
        },
        point: {
            type: Number
        },
        rewardPoint: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ITransaction>('Transaction', TransactionSchema)
