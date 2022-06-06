import { model, Document, Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export interface IMessage extends Document {
	user: Types.ObjectId;
  name: string;
  message: string;
	read: boolean;
	date: Date;
}

const MessageSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "users",
	},
	name: {
		type: String,
		default: "Anonymous",
	},
  message: String,
	read: {
		type: Boolean,
		default: false,
	},
	date: {
		type: Date,
		default: Date.now,
	},
});

MessageSchema.plugin(mongoosePaginate);

export default model<IMessage>("messages", MessageSchema);
