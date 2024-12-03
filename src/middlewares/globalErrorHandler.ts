import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { config } from "../config/config";
import { ApiErrorHandler } from "../utils/ApiErrorHandler";

const globalErrorHandle = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = err;
  if (!(error instanceof ApiErrorHandler)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;

    // set a message from native Error instance or a custom one
    const message = error.message || "Something went wrong";
    error = new ApiErrorHandler(
      statusCode,
      message,
      error?.errors || [],
      err.stack
    );
  }

  // Now we are sure that the `error` variable will be an instance of ApiError class
  const response = {
    ...error,
    message: error.message,
    ...(config.env === "development" ? { stack: error.stack } : {}),
  };

  // logger.error(`${error.message}`);

  // removeUnusedMulterImageFilesOnError(req);
  return res.status(error.statusCode).json(response);
};

export default globalErrorHandle;
