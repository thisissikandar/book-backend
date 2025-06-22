import express, { Request } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandle from "./middlewares/globalErrorHandler";
import { config } from "./config/config";
import rateLimit, { Options } from "express-rate-limit";
import requestIp from "request-ip";
const app = express();

app.use(
  cors({
    origin: config.corsOrigins === "*" ? "*" : config.corsOrigins?.split(","),
    credentials: true,
  })
);
app.use(requestIp.mw());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request): any => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options: Options) => {
    throw new ApiErrorHandler(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});
app.use(limiter);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  
  res.json({ messagee: "hello world server is listening" });
});

import userRouter from "./routes/auth/user.router";
import bookRouter from "./routes/books/book.router";
import { ApiErrorHandler } from "./utils/ApiErrorHandler";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

app.use(globalErrorHandle);

export default app;
