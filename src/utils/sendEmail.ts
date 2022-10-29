import sgMail, { MailDataRequired } from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY ?? "";

sgMail.setApiKey(
	"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"
);

export const sendMail = async (
	msg: MailDataRequired | MailDataRequired[]
): Promise<void> => {
	try {
		await sgMail.send(msg);
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.log(error, "FAILED TO SEND EMAIL!");
		}
	}
};
