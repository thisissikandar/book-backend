import { NextFunction, Request, Response } from "express";
import { Result, ValidationError, validationResult } from "express-validator";
import { ApiErrorHandler } from "../utils/ApiErrorHandler";


const validate = (req: Request, res: Response, next: NextFunction):void => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors: Record<string, string>[] = [];
  errors.array().forEach((err: ValidationError) => {
    extractedErrors.push({ [err.type]: err.msg });
  });

  throw new ApiErrorHandler(422, "Received data is not valid", extractedErrors);
};

export { validate };
