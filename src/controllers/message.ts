import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import User from "../models/User";
import Message from "../models/Message";
import RequestWithUser from "../definitions/RequestWithUser";

export const submitMessage = async (
	req: Request,
	res: Response,
	next: NextFunction
): Promise<Response | undefined> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({
				errors: errors.array(),
			});
		}
		const { message, name } = req.body;
		const { userId } = req.params;

		if (!mongoose.Types.ObjectId.isValid(userId)) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				errors: [
					{
						msg: "User not found",
						status: "404",
					},
				],
			});
		}

		if (name) {
			const newMessage = new Message({
				user: user.id,
				name,
				message,
			});
			await newMessage.save();

			return res.json({
				data: {
					msg: "Message submitted successfully",
					message,
				},
			});
		} else {
			const newMessage = new Message({
				user: user.id,
				message,
			});
			await newMessage.save();

			return res.json({
				data: {
					msg: "Message submitted successfully",
					message,
				},
			});
		}
	} catch (err) {
		next(err);
	}
};

// marks a message as read
export const markMessageRead = async (
	req: RequestWithUser,
	res: Response,
	next: NextFunction
): Promise<Response | undefined> => {
	try {
		const { messageId } = req.params;
		const user = await User.findById(req?.user?.id);
		const currentMessage = await Message.findById(messageId);

		if (!mongoose.Types.ObjectId.isValid(messageId)) {
			return res.status(404).json({
				errors: [
					{
						msg: "Message not found",
						status: "404",
					},
				],
			});
		}

		if (!currentMessage) {
			return res.status(404).json({
				errors: [
					{
						msg: "Message not found",
						status: "404",
					},
				],
			});
		}

		if (req?.user?.id !== currentMessage.user.toString()) {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}

		if (user && currentMessage) {
			currentMessage.read = true;
			await currentMessage.save();

			return res.json({
				data: {
					msg: "Message read successfully",
					Message: currentMessage,
				},
			});
		} else {
			return res.status(401).json({
				errors: [
					{
						msg: "Not authorized",
						status: "401",
					},
				],
			});
		}
	} catch (err) {
		next(err);
	}
};
