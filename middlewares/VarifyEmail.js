import { transporter } from "../middlewares/nodemailer.js";
import { Verification_Email_Template } from "../utils/Email_Template.js";
export const SendVarificationCode = async (email, varificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.QUICK_CHAT_EMAIL_ADDRESSS,
      to: email,
      subject: "Varify your email",
      text: "Varify your email",
      html: Verification_Email_Template.replace(
        "{verificationCode}",
        varificationCode
      ),
    });
    console.log("Email send successfully!", response);
  } catch (error) {
    console.log("Email send error!");
  }
};
