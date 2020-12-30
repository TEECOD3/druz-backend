import { Response, NextFunction } from "express";
import RequestWithUser from "../definitions/RequestWithUser";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User";
import Answer from "../models/Answer";
import isNameValid from "../utils/isNameValid";

// Edits profile of a user
export const editProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req?.user?.id);
    if (user) {
      if (name != undefined) {
        if (!isNameValid(name)) {
          return res.status(422).json({
            errors: [
              {
                msg: "This name is not available. Please try another",
                status: "422",
              },
            ],
          });
        }
        const findName = await User.findOne({ name });
        if (findName && name.toLowerCase() !== user.name) {
          return res.status(400).json({
            errors: [
              {
                msg: "Name is already taken. Please choose anther one",
                status: "400",
              },
            ],
          });
        }
        if (name.trim().length < 1) {
          return res.status(422).json({
            errors: [
              {
                msg: "Name is required",
                status: "422",
              },
            ],
          });
        }
        user.name = name;
      }

      if (email != undefined) {
        const findEmail = await User.findOne({ email });
        if (findEmail) {
          if (user.email && email.toLowerCase() !== user.email) {
            return res.status(400).json({
              errors: [
                {
                  msg: "Email is already taken. Please choose anther one",
                  status: "400",
                },
              ],
            });
          } else if (!user.email) {
            return res.status(400).json({
              errors: [
                {
                  msg: "Email is already taken. Please choose anther one",
                  status: "400",
                },
              ],
            });
          }
        }
        if (email.trim().length < 1) {
          return res.status(422).json({
            errors: [
              {
                msg: "Email is required",
                status: "422",
              },
            ],
          });
        }

        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
          return res.status(422).json({
            errors: [
              {
                msg: "Email is not valid",
                status: "422",
              },
            ],
          });
        }
        user.email = email;
      }

      await user.save();
      return res.json({
        data: {
          msg: "Profile updated successfully",
          name: user.name,
          email: user.email,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// change password
export const changePassword = async (
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
    const user = await User.findById(req?.user?.id);
    const { password } = req.body;

    if (user) {
      if (password.old && password.new) {
        const isCorrectPassword = await bcrypt.compare(
          password.old,
          user.password,
        );

        if (!isCorrectPassword) {
          return res.status(400).json({
            errors: [
              {
                msg: "Password is incorrect",
                status: "400",
              },
            ],
          });
        }

        if (typeof password.new == "string" && password.new.length < 4) {
          return res.status(422).json({
            errors: [
              {
                msg: "Password must be at least 4 characters",
                status: "422",
              },
            ],
          });
        }

        const hashedPassword = await bcrypt.hash(password.new, 8);
        user.password = hashedPassword;
        await user.save();
        return res.json({
          data: {
            msg: "Password changed successfully",
          },
        });
      }
      return res.status(422).json({
        errors: [
          {
            msg: "Password field is required",
            status: "422",
          },
        ],
      });
    }
  } catch (err) {
    next(err);
  }
};

// get dashboard information for a user
export const getDashboard = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const user = await User.findById(req?.user?.id);
    const answers = await Answer.find({ user: req?.user?.id }).count();

    if (user) {
      user.lastOnline = new Date();
      await user.save();

      return res.json({
        data: {
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            questions: user.questions.length,
            answers,
          },
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// delete account
export const deleteAccount = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const user = await User.findById(req?.user?.id);

    if (user) {
      await user.remove();
      await Answer.deleteMany({ user: req?.user?.id });
      return res.json({
        data: {
          msg: "Account successfully deleted.",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};
