import express from "express";
import { check } from "express-validator";
const router = express.Router();
import authenticate from "../middleware/authenticate";
import {
  addQuestion,
  editQuestion,
  removeQuestion,
} from "../controllers/question";

/*
 * @desc Add question
 * @method PATCH
 * @api Private
 */
router.patch(
  "/",
  [check("question", "Please add a question").notEmpty()],
  authenticate,
  addQuestion,
);

/*
 * @desc Edits a question
 * @method PATCH
 * @api Private
 */
router.patch(
  "/edit/:questionId",
  [
    check("question", "Question must be at least 5 characters").isLength({
      min: 5,
    }),
  ],
  authenticate,
  editQuestion,
);

/*
 * @desc Remove question
 * @method PATCH
 * @api Private
 */
router.delete("/:questionId", authenticate, removeQuestion);

export default router;
