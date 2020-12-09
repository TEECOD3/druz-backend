import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import User from "../models/User";
const redUnderline = chalk.red.underline;
const secret = process.env.JWT_SECRET || "secret";

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | undefined> => {
  try {
    const token = req.headers.authorization;
    const tokenString = token ? token.split(" ")[1] : undefined;
    if (!token || !tokenString) {
      return res.status(401).json({
        errors: [
          {
            msg: "Not authorized",
            status: "401",
          },
        ],
      });
    }

    // eslint-disable-next-line
    const decoded: any = jwt.verify(tokenString, secret);
    const findUser = await User.findById(decoded.user.id);
    if (!findUser) {
      return res.status(401).json({
        errors: [
          {
            msg: "Not authorized",
            status: "401",
          },
        ],
      });
    }

    if (findUser.lastLogout != undefined) {
      if (decoded.iat < findUser.lastLogout) {
        return res.status(401).json({
          errors: [
            {
              msg: "Not authorized",
              status: "401",
            },
          ],
        });
      }
    }
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error(redUnderline(`${err}`));
    return res.status(401).json({
      errors: [
        {
          msg: "Not authorized",
          status: "401",
        },
      ],
    });
  }
};

export default authenticate;
