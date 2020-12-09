import { model, Document, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IAnswer extends Document {
  user: Types.ObjectId;
  name: string;
  answers: { question: string; answer: string }[];
  date: Date;
}

const AnswerSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    default: "Anonymous",
  },
  answers: [
    {
      question: String,
      answer: String,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
});

AnswerSchema.plugin(mongoosePaginate);

export default model<IAnswer>("answers", AnswerSchema);
