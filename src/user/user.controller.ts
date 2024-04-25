import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import createHttpError from "http-errors";
import userModel from "./user.model";

const register = async (req: Request, res: Response, next: NextFunction) => {
  console.log("request body::", req.body);
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    // TODO: validate email and password
    const error = createHttpError(400, "All required fields");
    return next(error);
  }
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(500, "User Already Exists");
  }
  const hasedPassword =bcrypt.hash(password,10)
  res.json({ message: "success " });
};

export { register };
