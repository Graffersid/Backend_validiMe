//import mongoose, {Document, model, Schema} from "mongoose";
import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface IIdea extends Document {
    userId: ObjectId;
    age: number;
    gender: string;
    maritalStatus: string;
    occupption: string;
    country: string;
    state: string;
    city: string,
    title: string,
    description: string,
    question_1: Object,
    question_2: Object,
    question_3: Object,
    question_4: Object,
    question_5: Object,
    question_6: Object,
    question_7: Object,
    question_8: Object,
    question_9: Object,
    question_10: Object,
    status: boolean,
    is_active: boolean,
}

const IdeaSchema = new Schema<IIdea>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        age: {
            type: Number,
            required: true
        },
        gender: {
            type: String,
            required: true
        },
        maritalStatus: {
            type: String,
            required: true
        },
        occupption: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        status: {
            type: Boolean,
            default: true
        },
        //is_active:  { type: Boolean, default: true },
        question_1: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_2: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_3: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_4: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_5: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_6: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_7: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_8: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_9: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        },
        question_10: {
            question: { type: String },
            answer_A: { type: String },
            answer_B: { type: String},
            answer_C: { type: String},
            answer_D: { type: String},
        }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<IIdea>('Idea', IdeaSchema)

