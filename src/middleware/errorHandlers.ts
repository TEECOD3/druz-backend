import {
  Router,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import chalk from "chalk";
const redUnderline = chalk.red.underline;

const handleNotFound = (router: Router): void => {
  router.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      errors: [
        {
          msg: "Not found",
          status: "404",
        },
      ],
    });
    next();
  });
};

const handlerServerError = (router: Router): void => {
  router.use(
    (
      err: ErrorRequestHandler,
      req: Request,
      res: Response,
      next: NextFunction,
    ) => {
      res.statusCode = 500;
      console.error(redUnderline(`${err}`));
      res.json({
        errors: [
          {
            msg: "Oops, Something went wrong from our end.",
            status: "500",
          },
        ],
      });
      next(err);
    },
  );
};

export default [handleNotFound, handlerServerError];
