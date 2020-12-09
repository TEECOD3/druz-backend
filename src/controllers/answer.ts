import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import User from "../models/User";
import Answer from "../models/Answer";

// submits the answers to user's questions
export const submitAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    const { answers, name } = req.body;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({
        errors: [
          {
            msg: "User not found",
            status: "404",
          },
        ],
      });
    }
    const user = await User.findById(userId);
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

    let newAnswer;

    if (name) {
      newAnswer = new Answer({
        user: user.id,
        name,
        answers,
      });
    } else {
      newAnswer = new Answer({
        user: user.id,
        answers,
      });
    }

    await newAnswer.save();

    return res.json({
      data: {
        msg: "Answers submitted successfully",
        answers,
      },
    });
  } catch (err) {
    next(err);
  }
};
