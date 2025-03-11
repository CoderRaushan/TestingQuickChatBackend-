import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, 
    secure: false, 
    auth: {
        user:process.env.QUICK_CHAT_EMAIL_ADDRESSS,
        pass:process.env.NODE_MAILER_PASS,
    },
});
