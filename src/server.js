import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./db/db.js";

const port = process.env.PORT || 8080;

const startServer = async () => {
  const db = await connectDB();

  if (db) {
    app.listen(port, () => console.log(`server is running at ${port}, DB connected to host ${db.connection.host}`));
  } else {
    console.log(`shutting down the server due to DB connection failure`);
    process.exit(1);
  }
};

startServer();
