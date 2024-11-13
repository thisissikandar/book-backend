import express from "express";
import globalErrorHandle from "./middlewares/globalErrorHandler";

const app = express();
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({ limit: "16kb" }));
app.get("/", (req, res) => {
  // const error = createHttpError(400, "something went wrong");
  // throw error;
  res.json({ messagee: "hello world server is listening" });
});
import userRouter from "./user/user.router";
import bookRouter from "./book/book.router";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRouter);

app.use(globalErrorHandle);

export default app;
