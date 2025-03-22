import express from "express";

const app = express();

// Import Routes Below
import authRouter from "./routes/auth.routes.js";

// Route Declaration Below
app.use("/api/v1/auth", authRouter);

export default app;
