import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

const register = async (req: Request, res: Response, next: NextFunction) => {
  console.log("request body::", req.body);
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    // TODO: validate email and password
    const error = createHttpError(400, "All required fields");
    return next(error);
  } 
  res.json({ message: "success" });
};

export { register };
