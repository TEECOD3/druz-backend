import express from "express";
import { check } from "express-validator";
const router = express.Router();
import { submitAnswers, markAnswerRead } from "../controllers/answer";
import authenticate from "../middleware/authenticate";

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

/*
 * @desc Mark an answer as read/seen
 * @method PATCH
 * @api Private
 */
router.patch("/read/:answerId", authenticate, markAnswerRead);

export default router;
