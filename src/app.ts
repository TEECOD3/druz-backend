import dotenv from "dotenv";
dotenv.config();
import path from "path";
import express, { Router, Request, Response, NextFunction } from "express";
import routes from "./routes";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorHandlers";
import { applyRoutes, applyMiddleware, connectDB } from "./utils";
const app = express();

connectDB();

/* Replace the following with DO ip address if need be later */
// if (process.env.NODE_ENV === "production") {
//   app.get("*", (req: Request, res: Response, next: NextFunction) => {
//     if (/herokuapp.com/.test(req.headers.host || "")) {
//       res.redirect(301, `https://www.druz.xyz${req.url}`);
//     } else {
//       next();
//     }
//   });
// }

applyMiddleware(middleware, app);

app.get("/", (req, res) => {
  res.send("API is up and running");
});

applyRoutes(routes, app);

applyMiddleware(errorHandlers, app);

export default app;
