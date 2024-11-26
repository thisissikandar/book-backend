import { Request, Response } from "express";
import bcrypt from "bcrypt";

import userModel from "../../models/auth/user.model";
import { ApiResponseHandler } from "../../utils/ApiResponseHandler";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiErrorHandler } from "../../utils/ApiErrorHandler";
import { CustomRequest } from "../../middlewares/authMiddleware";
import { UserRolesEnum } from "../../constants";
import { config } from "../../config/config";

const generateRefreshTokenAccessToken = async (userId: string) => {
  const user = await userModel.findById(userId);
  if (!user) {
    throw new ApiErrorHandler(400, "User not found ", []);
  }
  try {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrorHandler(
      500,
      "Error While Generating Access Token and Refresh Token",
      []
    );
  }
};
const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  console.log(req.body);

  if (!email || !password || !name) {
    throw new ApiErrorHandler(400, "All required fields");
  }

  const user = await userModel.findOne({ email });
  if (user) {
    throw new ApiErrorHandler(500, "User Already Exists");
  }

  const newUser = await userModel.create({
    name,
    email,
    password,
    role: role || UserRolesEnum.USER,
  });
  return res
    .status(201)
    .json(
      new ApiResponseHandler(
        200,
        { newUser },
        "register successfully Please Login"
      )
    );
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!password || !email) {
    throw new ApiErrorHandler(400, "All required fields");
  }

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiErrorHandler(400, "user Not found with this email");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiErrorHandler(400, "Incorrect Password");
  }
  const { accessToken, refreshToken } = await generateRefreshTokenAccessToken(
    user._id
  );

  const loggedInUser = await userModel
    .findById(user._id)
    .select(" -password, -refreshToken ");
  const options = {
    httpOnly: true,
    secure: config.env === "production",
  };
  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponseHandler(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Login successfully"
      )
    );
});
const logOut = asyncHandler(async (req: CustomRequest, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
      },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: config.env === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponseHandler(200, {}, "User logged out"));
});

export { register, login, logOut };
