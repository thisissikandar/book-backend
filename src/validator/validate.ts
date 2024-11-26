import { NextFunction, Request, Response } from "express";
import { Result, validationResult } from "express-validator";
import createHttpError from "http-errors";

// type FieldValidationError = {
//   type: "field";
//   location: Location;
//   path: string;
//   value: any;
//   msg: any;
// };
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors: Result = validationResult(req);
  if (errors.isEmpty()) {
    next(); 
  }
  const extractedErrors: Record<string, string>[] = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
  createHttpError(422, "Received data is not valid", extractedErrors);
};

export { validate };
