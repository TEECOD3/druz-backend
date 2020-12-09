import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  name: "www.druz.xyz",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

let domain: string;
if (process.env.NODE_ENV === "production") {
  domain = "https://www.druz.xyz/reset-password";
} else {
  domain = "http://localhost:3000/reset-password";
}

const sendResetEmail = (to: string, token: string): void =>
  transporter.sendMail(
    {
      from: process.env.GMAIL,
      to,
      subject: "Druz Password Reset link!",
      html: `<h2> Hi, we received a request to reset your Druz account password.</h2> <p>To complete this process, please click on the link below. <br /> <br /> ${domain}?t=${token}&email=${to}</p>
								<p>Please note that the link will expire one hour after it was sent. But if you didn't ask to change your password, do not worry! <br/>Your password is still safe and you can delete this email.</p> <br /> 
								<p>Warm Regards.</p>
          `,
    },
    function (err, info) {
      if (err) console.log(err);
      else console.log(info);
    },
  );

export default sendResetEmail;
