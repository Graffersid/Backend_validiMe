import mongoose, { Schema, Document, Types, ObjectId } from "mongoose";

export interface IValidate extends Document {
    userId: ObjectId;
    ideaId: ObjectId;
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
    status: boolean
}

const ValidateIdeaSchema = new Schema<IValidate>({
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
}, {
    timestamps: true
    }
)

export default mongoose.model<IValidate>('ValidateIdea', ValidateIdeaSchema)
