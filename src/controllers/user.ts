import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import User from "../models/User";

// Get a user profile id or name
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { id, name } = req.query;
    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id.toString())) {
        return res.status(404).json({
          errors: [
            {
              msg: "User not found",
              status: "404",
            },
          ],
        });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          errors: [
            {
              msg: "User not found",
              status: "404",
            },
          ],
        });
      }

      return res.json({
        data: {
          user: {
            name: user.name,
            questions: user.questions,
            _id: user._id,
          },
        },
      });
    }
    if (name) {
      const user = await User.findOne({ name: name.toString() });

      if (!user) {
        return res.status(404).json({
          errors: [
            {
              msg: "User not found",
              status: "404",
            },
          ],
        });
      }

      return res.json({
        data: {
          user: {
            name: user.name,
            questions: user.questions,
            _id: user.id,
          },
        },
      });
    }

    return res.status(404).json({
      errors: [
        {
          msg: "User not found",
          status: "404",
        },
      ],
    });
  } catch (err) {
    next(err);
  }
};
