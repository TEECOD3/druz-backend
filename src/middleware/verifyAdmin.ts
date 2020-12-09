import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
const adminPassword = process.env.ADMIN_PASSWORD || "testpassword";
const adminName = process.env.ADMIN_NAME;
const adminEmail = process.env.ADMIN_EMAIL;

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: IUser | null = await User.findById(req.user.id);

    const isCorrectPassword = await bcrypt.compare(
      adminPassword,
      user!.password,
    );

    if (
      user!.name !== adminName ||
      user!.email !== adminEmail ||
      !isCorrectPassword
    ) {
      return res.status(403).json({
        errors: [
          {
            msg: "Not allowed!!! Get the fuck out of here asshole",
            status: "403",
          },
        ],
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default verifyAdmin;
