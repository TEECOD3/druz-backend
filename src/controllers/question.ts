import { Response, NextFunction } from "express";
import RequestWithUser from "../definitions/RequestWithUser";
import { validationResult } from "express-validator";
import User from "../models/User";

// adds a question a user's profile
export const addQuestion = async (
  req: RequestWithUser,
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

    const user = await User.findById(req.user!.id);
    if (user) {
      if (user.questions.length >= 12) {
        return res.status(400).json({
          errors: [
            {
              msg: "You can't have more than 12 questions in your profile",
              status: "400",
            },
          ],
        });
      }
      const { question } = req.body;

      user.questions.push({ content: question });
      await user.save();

      return res.json({
        data: {
          msg: "Question added successfully",
          questions: user.questions,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// removes a question
export const removeQuestion = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { questionId } = req.params;
    const user = await User.findById(req.user!.id);

    if (user) {
      if (user.questions.length <= 2) {
        return res.status(400).json({
          errors: [
            {
              msg: "You must have at least two questions in your profile",
              status: "400",
            },
          ],
        });
      }

      const index = user.questions.findIndex(
        (question) => question!._id!.toString() === questionId,
      );

      if (index === -1) {
        return res.status(404).json({
          errors: [
            {
              msg: "Question not found",
              status: "404",
            },
          ],
        });
      }
      user.questions.splice(index, 1);
      await user.save();

      return res.json({
        data: {
          msg: "Question removed successfully",
          questions: user.questions,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// edits a question
export const editQuestion = async (
  req: RequestWithUser,
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

    const { questionId } = req.params;
    const { question } = req.body;
    const user = await User.findById(req.user!.id);

    if (user) {
      const index = user.questions.findIndex(
        (question) => question!._id!.toString() === questionId,
      );

      if (index === -1) {
        return res.status(404).json({
          errors: [
            {
              msg: "Question not found",
              status: "404",
            },
          ],
        });
      }
      // user.questions.splice(index, 1);
      user.questions[index].content = question;

      await user.save();

      return res.json({
        data: {
          msg: "Question edited successfully",
          questions: user.questions,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};
