import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { config } from "../config/config";
import userModel from "../models/auth/user.model";
import { ApiErrorHandler } from "../utils/ApiErrorHandler";

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
      throw new ApiErrorHandler(401, "Unauthorized Request");
    }
    const decodedToken = jwt.verify(
      token,
      config.jwtAccessTokenSecret as string
    ) as JwtPayload;

    const user = await userModel
      .findById(decodedToken?._id)
      .select("-password -refreshToken");
    if (!user) {
      throw new ApiErrorHandler(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (error: any) {
    throw new ApiErrorHandler(401, error?.message || "Invalid Access Token");
  }
};
