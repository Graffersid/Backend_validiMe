import mongoose, {Document, model, Schema} from "mongoose";

export interface IBook {
    title: string;
    author: string;
}

export interface IBookModel extends IBook, Document {


}

const BookSchema: Schema = new Schema(
    {
        title: { type: String },
        author: { type: Schema.Types.ObjectId, required: true, ref: 'Author'},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model<IBookModel>('Book', BookSchema)