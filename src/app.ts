import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
import globalErrorHandle from "./middlewares/globalErrorHandler";
import { config } from "./config/config";

const app = express();
app.use(
  cors({
    origin: config.corsOrigins === "*" ? "*" : config.corsOrigins?.split(","),
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.get("/", (req, res) => {
  // const error = createHttpError(400, "something went wrong");
  // throw error;
  res.json({ messagee: "hello world server is listening" });
});

import userRouter from "./routes/auth/user.router";
import bookRouter from "./routes/books/book.router";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

app.use(globalErrorHandle);

export default app;
