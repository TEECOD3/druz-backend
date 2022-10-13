import express from "express";
import { check } from "express-validator";
const router = express.Router();
import { markMessageRead, submitMessage } from "../controllers/message";
import authenticate from "../middleware/authenticate";

/*
 * @desc Submits a message for a user
 * @method POST
 * @api Public
 */
router.post(
	"/:userId",
	[check("message", "Please add a message").notEmpty()],
	submitMessage
);

/*
 * @desc Mark a message as read/seen
 * @method PATCH
 * @api Private
 */
router.patch("/read/:messageId", authenticate, markMessageRead);

export default router;
