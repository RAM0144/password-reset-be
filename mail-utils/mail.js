import nodemailer from "nodemailer";

import dotenv from "dotenv";


dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "test016322@gmail.com",
        pass: process.env.GMAIL_PASSWORD || "",
    },
});

const mailOption = {
    from: "test016322@gmail.com",
    to: [],
    subject: "Hey, welcome to the Application!!",
    text: "Welcome to Our management Application" 
};

export { transporter, mailOption };