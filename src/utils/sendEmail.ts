import sgMail, { MailDataRequired } from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

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
