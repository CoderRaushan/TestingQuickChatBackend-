import { transporter } from "../middlewares/nodemailer.js";
import { Welcome_Email_Template } from "../utils/Email_Template.js";
export const WelComeMessage = async (email,name) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.QUICK_CHAT_EMAIL_ADDRESSS,
      to: email,
      subject: "Welcome Message!",
      text: "Welcome User!",
      html: Welcome_Email_Template.replace(
        "{name}",
        name
      ),
    });
    console.log("Welcome Email successfully!", response);
  } catch (error) {
    console.log("Welcome Email send error!");
  }
};
