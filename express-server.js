import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectToDB from "./db-utils/mongodb.js";
import authRouter from "./auth.js";


const server = express();

// Body Parsing the Middleware
server.use(express.json());

server.use(cors());

dotenv.config();

const logger = (req, res, next) => {
    console.log(new Date().toString(), req.url, req.method);
    next();
}
// using the custom middleware
server.use(logger);


// connecting to db before server Starts
// Top level await
await connectToDB();

server.use("/auth", authRouter);

const port = 6100;

server.listen(port, () => {
    console.log(Date().toString(), "listening on port", port);
});

