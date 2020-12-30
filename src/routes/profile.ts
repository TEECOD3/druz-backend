import express from "express";
import { check } from "express-validator";
const router = express.Router();
import authenticate from "../middleware/authenticate";
import {
  editProfile,
  changePassword,
  deleteAccount,
  getDashboard,
} from "../controllers/profile";

/*
 * @desc Gets users dashboard
 * @method GET
 * @api Private
 */
router.get("/dashboard", authenticate, getDashboard);

/*
 * @desc Edits a user info(name and email)
 * @method PATCH
 * @api Private
 */
router.patch("/", authenticate, editProfile);

/*
 * @desc Changes a user password. password fields is an object of old and new password
 * @method PATCH
 * @api Private
 */
router.patch(
  "/password",
  [check("password", "Password field is required").notEmpty()],
  authenticate,
  changePassword,
);

/*
 * @desc Deletes a user account
 * @method DELETE
 * @api Private
 */
router.delete("/", authenticate, deleteAccount);

export default router;
