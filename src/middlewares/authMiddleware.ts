import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken";

import { config } from "../config/config";
import userModel from "../user/user.model";

export interface CustomRequest extends Request {
  user?: any;
}

export const verifyJWT = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return next(createHttpError(401, "Unauthorized Request"));
    }
    const decodedToken = jwt.verify(
      token,
      config.jwtSecret as string
    ) as JwtPayload;

    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken");
    if (!user) {
      return next(createHttpError(401, "Invalid Access Token"));
    }
    req.user = user;
    next();
  } catch (error: any) {
    return next(createHttpError(401, error?.message || "Invalid Access Token"));
  }
};
