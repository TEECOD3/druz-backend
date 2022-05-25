import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import User from "../models/User";
import Answer from "../models/Answer";
import RequestWithUser from "../definitions/RequestWithUser";

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

// marks an answer as read
export const markAnswerRead = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { answerId } = req.params;
    const user = await User.findById(req?.user?.id);
    const currentAnswer = await Answer.findById(answerId);

    if (!mongoose.Types.ObjectId.isValid(answerId)) {
      return res.status(404).json({
        errors: [
          {
            msg: "Answer not found",
            status: "404",
          },
        ],
      });
    }

    if (!currentAnswer) {
      return res.status(404).json({
        errors: [
          {
            msg: "Answer not found",
            status: "404",
          },
        ],
      });
    }

    if (req?.user?.id !== currentAnswer.user.toString()) {
      return res.status(401).json({
        errors: [
          {
            msg: "Not authorized",
            status: "401",
          },
        ],
      });
    }

    if (user && currentAnswer) {
      currentAnswer.read = true;
      await currentAnswer.save();

      return res.json({
        data: {
          msg: "Answer read successfully",
          answer: currentAnswer,
        },
      });
    } else {
      return res.status(401).json({
        errors: [
          {
            msg: "Not authorized",
            status: "401",
          },
        ],
      });
    }
  } catch (err) {
    next(err);
  }
};
