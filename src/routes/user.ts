import express from "express";
const router = express.Router();
import { getUserProfile } from "../controllers/user";

/*
 * @desc Gets a user profile by id or name. makes use of req.params
 * @method GET
 * @api Public
 */
router.get("/", getUserProfile);

export default router;
