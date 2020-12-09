import express from "express";
import { check } from "express-validator";
const router = express.Router();
import { submitAnswers } from "../controllers/answer";

/*
 * @desc Submits answers to a user's questions
 * @method POST
 * @api Public
 */
router.post(
  "/:userId",
  [check("answers", "Please add answers").notEmpty()],
  submitAnswers,
);

export default router;
