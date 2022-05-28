import { Response, NextFunction } from "express";
import RequestWithUser from "../definitions/RequestWithUser";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import Answer from "../models/Answer";
import sendResetEmail from "../utils/sendResetEmail";
import generateToken from "../utils/generateToken";
import isNameValid from "../utils/isNameValid";
import { isPasswordValid } from "../utils";
import defaultQuestions from "../utils/defaultQuestions";
const secret = process.env.JWT_SECRET || "secret";

// register a user
export const register = async (
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
    const { name, email, password, role } = req.body;

    if (!isNameValid(name)) {
      return res.status(422).json({
        errors: [
          {
            msg: "This name is unavailable. Please choose another one",
            status: "422",
          },
        ],
      });
    }

    if (!isPasswordValid(password)) {
      return res.status(422).json({
        errors: [
          {
            msg: "Your password must be at least 8 characters long",
            status: "422",
          },
        ],
      });
    }

    const checkName = await User.findOne({ name });
    const checkEmail = email ? await User.findOne({ email }) : undefined;

    if (checkName) {
      return res.status(400).json({
        errors: [
          {
            msg: "Name is already taken. Pick another one",
            status: "400",
          },
        ],
      });
    }

    if (checkEmail) {
      return res.status(400).json({
        errors: [
          {
            msg: "Email is already taken. Pick another one",
            status: "400",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    let user: IUser;
    if (email !== undefined) {
      user = new User({
        name,
        email,
        password: hashedPassword,
      });
    } else {
      user = new User({
        name,
        password: hashedPassword,
      });
    }

    // populate user with default questions.
    defaultQuestions.forEach((question) => {
      user.questions.push(question);
    });

    if (role) {
      user.role = role;
    }

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
      iat: new Date().getTime(),
    };

    jwt.sign(payload, secret, { expiresIn: "150d" }, (err, token) => {
      if (err) throw err;
      return res.json({
        data: {
          msg: "Register successful",
          token,
          user: {
            _id: user.id,
            name,
            email: user.email,
            questions: user.questions,
          },
        },
      });
    });
  } catch (err) {
    next(err);
  }
};

// logs in a user
export const login = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Incorrect name or password",
            status: "400",
          },
        ],
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({
        errors: [
          {
            msg: "Incorrect name or password",
            status: "400",
          },
        ],
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
      iat: new Date().getTime(),
    };

    jwt.sign(payload, secret, { expiresIn: "150d" }, (err, token) => {
      if (err) throw err;
      return res.json({
        data: {
          msg: "Login successful",
          token,
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            questions: user.questions,
          },
        },
      });
    });
  } catch (err) {
    next(err);
  }
};

// logs out a user
export const logout = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const user = await User.findById(req?.user?.id);
    if (user) {
      user.lastLogout = new Date();
      await user.save();
      return res.json({
        data: {
          msg: "Logout successful",
        },
      });
    } else {
      return res.json({
        errors: [
          {
            msg: "Unauthorized",
            status: "401",
          },
        ],
      });
    }
  } catch (err) {
    next(err);
  }
};

// gets a logged in user
export const getUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const user = await User.findById(req?.user?.id);
    // keep track of their last online session
    if (user) {
      const { alongwith, limit = 10, page = 1 } = req.query;
      if (alongwith === "answers") {
        // eslint-disable-next-line
        // @ts-ignore
        const answers = await Answer.paginate(
          { user: user.id },
          { limit, page, sort: { date: -1 }, lean: true },
        );
        // .sort({ date: -1 });
        return res.json({
          data: {
            user: {
              _id: user.id,
              name: user.name,
              email: user.email,
              questions: user.questions,
              answers,
            },
          },
        });
      } else {
        return res.json({
          data: {
            user: {
              _id: user.id,
              name: user.name,
              email: user.email,
              questions: user.questions,
            },
          },
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

// forgot password
export const forgotPassword = async (
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

    const { name } = req.body;
    const user = await User.findOne({ name });
    if (!user) {
      return res.json({
        data: {
          msg: "Reset link sent successfully to your email.",
        },
      });
    } else {
      if (!user.email) {
        return res.json({
          data: {
            msg: "Reset link sent successfully to your email.",
          },
        });
      }
      const token = generateToken();
      user.resetToken = token;
      user.resetTokenExpirationDate = new Date(Date.now() + 3600000);
      await user.save();
      sendResetEmail(user.email, token);
      return res.json({
        data: {
          msg: "Reset link sent successfully to your email.",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

// reset password
export const resetPassword = async (
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
    const { token, email } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetTokenExpirationDate: { $gt: new Date(Date.now()) },
      email,
      resetToken: token,
    });

    if (!user) {
      return res.status(400).json({
        errors: [
          {
            msg: "Incorrect credentials provided",
            status: "400",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 8);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpirationDate = undefined;
    await user.save();

    return res.json({
      data: {
        msg: "Password updated successfully",
      },
    });
  } catch (err) {
    next(err);
  }
};
