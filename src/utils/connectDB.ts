import mongoose from "mongoose";
import chalk from "chalk";
const redUnderline = chalk.red.underline;
const magentaUnderline = chalk.magenta.underline;
const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/druz-db";

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(mongoURI, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(magentaUnderline("MongoDB Connected!!"));
  } catch (err) {
    console.error(redUnderline(`${err}`));
    process.exit(1);
  }
};

export default connectDB;
