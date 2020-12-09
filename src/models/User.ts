import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  role: "user" | "admin" | "super_admin";
  email?: string;
  password: string;
  resetToken?: string;
  resetTokenExpirationDate?: Date;
  lastLogout?: Date;
  lastOnline?: Date;
  questions: {
    content: string;
    date?: Date;
    _id?: Types.ObjectId;
  }[];
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    role: {
      type: String,
      default: "user",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetToken: String,
    resetTokenExpirationDate: Date,
    lastLogout: Date,
    lastOnline: Date,
    questions: [
      {
        content: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export default model<IUser>("users", UserSchema);
