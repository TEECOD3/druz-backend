import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import User from "../models/User";
import Answer from "../models/Answer";
import RequestWithUser from "../definitions/RequestWithUser";
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME;

// get all users' info
export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    // const users = await User.find({}).select(["-password"]).sort({ date: -1 });
    return res.json({
      data: {
        msg: "successfully fetched shit",
      },
    });
  } catch (err) {
    next(err);
  }
};

// remove a user
export const removeUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
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
    } else {
      await user.remove();
      await Answer.deleteMany({ user: req?.user?.id });
      return res.json({
        data: {
          msg: "User successfully removed",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// dashboard pass
export const dashboardPass = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(404).json({
        errors: errors.array(),
      });
    }
    const { name, password } = req.body;
    if (name !== adminName || password !== adminPassword) {
      return res.status(404).json({
        errors: [
          {
            msg: "Not found",
            status: "404",
          },
        ],
      });
    }

    return res.json({
      data: {
        msg: "hell yeah.",
      },
    });
  } catch (err) {
    next(err);
  }
};

// get basic data
export const getBasicData = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const allUsers = await User.find().count();
    const allAnswers = await Answer.find().count();
    return res.json({
      data: {
        totalUsers: allUsers,
        totalAnswers: allAnswers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// search and get single user
export const searchUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { name } = req.params;
    // console.log(req.body);
    if (!name) {
      return res.status(422).json({
        errors: [
          {
            msg: "Include a name.",
            status: "422",
          },
        ],
      });
    }
    const user = await User.findOne({ name: name });
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
        user,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const clearOldAnswers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    await Answer.deleteMany({
      date: { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    });
    return res.json({
      data: {
        property: "successfully removed.",
      },
    });
  } catch (err) {
    next(err);
  }
};

// remove inactive users
export const removeInactiveUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    await User.deleteMany({
      lastOnline: { $lt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) },
    });

    return res.json({
      data: {
        property: "successfully removed users.",
      },
    });
  } catch (err) {
    next(err);
  }
};
