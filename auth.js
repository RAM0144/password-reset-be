import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "./db-utils/mongodb.js";
import { transporter, mailOption } from "./mail-utils/mail.js";


const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
    try {
        const userDetails = req.body;

        bcrypt.hash(userDetails.password, 10, async (err, hash) => {
            if (err) {
                res.status(500).send({ msg: "Something went wrong, please try again" });
            } else {
                const tempData = {
                    ...userDetails,
                    password: hash,
                };
                await db.collection("users").insertOne({
                    ...tempData
                    
                });
 
                await transporter.sendMail({
                    ...mailOption,
                    to: [userDetails.email],
                });

                
                res.send({ msg: "Registration Successfully!!" });
            }
        });

    } catch (error) {
        console.log("Error", error);
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const creds = req.body;

        const userObj = await db.collection("users").findOne({ email: creds.identifier }, { projection: { _id: 0, _v: 0 } });

        if (userObj) {
            bcrypt.compare(creds.password, userObj.password, (err, result) => {
                if (result) {
                    const tempUser = { ...userObj };
                    delete tempUser.password;

                    const token = jwt.sign(tempUser, process.env.JWT_SECRET,
                        {
                            expiresIn: process.env.EXPIRY_TIME,
                        });
                    res.send({ msg: "Login Successfully!", userToken: token });
                } else {
                    res.status(401).send({ msg: "Invalid Username or Password" });
                }
            });
        } else {
            res.status(401).send({ msg: "Invalid Username or Password" });
        }
    } catch (error) {
        console.log("Error", error);
        res.status(500).send({ msg: "Internal Server Error" });
    }
});

authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
  
    const user =  await db.collection("users").findOne(u => u.email === email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const resetToken = jwt.sign(
        {email: user.email},
        process.env.JWT_SECRET,

    ); // You should generate a secure token here
    const resetLink = `${process.env.FE_URL}/reset-password?token=${resetToken}`;
  
    const mailOptions = {
      from: "test016322@gmail.com",
      to: user.email,
      subject: 'Password Reset',
      text: `Hello ${user.name},\n\nPlease click on the following link to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nThank you!`
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ message: 'Error sending email', error });
      }
      res.status(200).json({ message: 'Password reset email sent', info });
    });
  });
  
 

export default authRouter;