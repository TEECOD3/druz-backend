import express from "express";
import { check } from "express-validator";
const router = express.Router();
import authenticate from "../middleware/authenticate";
import {
  register,
  login,
  logout,
  getUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth";

/*
 * @desc Registers a user
 * @method POST
 * @api Public
 */
router.post(
  "/register",
  [
    check("name", "Name is required").notEmpty(),
    check("password", "Password must be at least 4 characters").isLength({
      min: 4,
    }),
  ],
  register,
);

/*
 * @desc Logs in a user
 * @method POST
 * @api Public
 */
router.post("/login", login);

/*
 * @desc Logs out a user
 * @method POST
 * @api private
 */
router.post("/logout", authenticate, logout);

/*
 * @desc Gets logged in user
 * @method GET
 * @api Private
 */
router.get("/user", authenticate, getUser);

/*
 * @desc forgot password
 * @method POST
 * @api Public
 */
router.post(
  "/forgot-password",
  [check("name", "Name field is required").notEmpty()],
  forgotPassword,
);

/*
 * @desc resets password
 * @method POST
 * @api Public
 */
router.patch(
  "/reset-password/:token/:email",
  [
    check("password", "Password must be at least 4 characters").isLength({
      min: 4,
    }),
  ],
  resetPassword,
);

export default router;
