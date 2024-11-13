import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import createHttpError from "http-errors";

import userModel from "./user.model";
import { config } from "../config/config";
import { User } from "./user.type";

const register = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    // TODO: validate email and password
    const error = createHttpError(400, "All required fields");
    return next(error);
  }

  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(500, "User Already Exists");
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error While getting User"));
  }

  const hasedPassword = await bcrypt.hash(password, 10);
  let newUser;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hasedPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error While creating User"));
  }
  try {
    const jwt = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    return res.status(201).json({ accessToken: jwt });
  } catch (error) {
    return next(createHttpError(500, "Error While Signing JWT"));
  }
};
const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!password || !email) {
    // TODO: validate email and password
    const error = createHttpError(400, "All required fields");
    return next(error);
  }
  let user;
  try {
    user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(400, "user Not found with this email"));
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting email"));
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(createHttpError(400, "Incorrect Password"));
  }
  const accessToken = sign({ _id: user._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });
  return res.json({ accessToken: accessToken });
};

export { register, login };
