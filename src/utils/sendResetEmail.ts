import { sendMail } from "../utils/sendEmail";

let domain: string;
if (process.env.NODE_ENV === "production") {
	domain = "https://www.druz.xyz/reset-password";
} else {
	domain = "http://localhost:3002/reset-password";
}

const sendResetEmail = (to: string, token: string): void => {
	sendMail({
		to,
		from: "Druz <hello@druz.xyz>",
		subject: "Reset your Druz Password",
    html: `
    <h3>Hi, we received a request to reset your Druz account password.</h3>
    <p>To complete this process, please click on the link below. <br /> <br /> ${domain}?t=${token}&email=${to}</p>
    <p>Please note that the link will expire one hour after it was sent. But if you didn't ask to change your password, do not worry! <br/>Your password is still safe and you can delete this email.</p> 
    <br /> 
    <p>Warm Regards.</p>
          `,
	});
};

export default sendResetEmail;
