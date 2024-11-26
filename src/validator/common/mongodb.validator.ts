import { body, param } from "express-validator";

export const mongoIdPathVariableValidator = (idName: string) => {
  return [
    param(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`),
  ];
};


// checking in body
export const mongoIdRequestBodyValidator = (idName: string) => {
  return [body(idName).notEmpty().isMongoId().withMessage(`Invalid ${idName}`)];
};
