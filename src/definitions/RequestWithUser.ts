import { Request } from "express";
import { IUser } from "../models/User";

interface RequestWithUser extends Request {
  user?: IUser;
}
export default RequestWithUser;
