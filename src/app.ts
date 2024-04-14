import express from "express";
import createHttpError, { HttpError } from "http-errors";
import  globalErrorHandle from "./middlewares/globalErrorHandler";

const app = express();

app.get("/", (req, res) => {
  const error = createHttpError(400, "something went wrong");
  throw error;
  res.json({ messagee: "hello world server is listening" });
});

app.use(globalErrorHandle);

export default app;
