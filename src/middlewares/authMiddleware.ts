import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { config } from "../config/config";
import userModel from "../models/auth/user.model";
import { ApiErrorHandler } from "../utils/ApiErrorHandler";
import { asyncHandler } from "../utils/asyncHandler";

export interface CustomRequest extends Request {
  user?: any;
}

export const verifyJWT = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiErrorHandler(401, "Unauthorized Request");
    }
    try {
      const decodedToken = jwt.verify(
        token,
        config?.jwtAccessTokenSecret!
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
  }
);
export const verifyPermission = (roles = []) =>
  asyncHandler(async (req:CustomRequest, res, next) => {
    if (!req.user?._id) {
      throw new ApiErrorHandler(401, "Unauthorized request");
    }
    // if (roles.includes(req.user?.role)) {
    //   next();
    // } else {
    //   throw new ApiErrorHandler(403, "You are not allowed to perform this action");
    // }
  });