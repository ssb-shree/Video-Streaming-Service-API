import express from "express";
import fileUpload from "express-fileupload";

import cookieParser from "cookie-parser";

const app = express();

// MiddleWares Below
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/public/",
  }),
);

// Import Routes Below
import authRouter from "./routes/auth.routes.js";

// Route Declaration Below
app.use("/api/v1/auth", authRouter);

app.get("/ping", async (req, res) => res.status(200).json({ message: "pong" }));

export default app;
