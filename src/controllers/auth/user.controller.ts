import { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

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
    await user.save({ validateBeforeSave: false });
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

  if (!email || !password || !name) {
    throw new ApiErrorHandler(400, "All required fields", []);
  }

  const user = await userModel.findOne({ email });
  if (user) {
    throw new ApiErrorHandler(
      409,
      "User with email or username already exists"
    );
  }

  const newUser = await userModel.create({
    name,
    email,
    password,
    role: role || UserRolesEnum.USER,
  });

  const createdUser = await userModel
    .findById(newUser._id)
    .select("-password -refreshToken ");

  if (!createdUser) {
    throw new ApiErrorHandler(
      500,
      "Something went wrong while registering the user"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponseHandler(
        200,
        { createdUser },
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
    throw new ApiErrorHandler(400, "User Not found with this email");
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
    .select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

  const options = {
    httpOnly: true,
    secure: config.env === "production",
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponseHandler(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully"
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
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiErrorHandler(401, "Unauthorized request");
  }

  try {
    const decodedToken = verify(
      incomingRefreshToken,
      config.jwtRefreshTokenSecret as string
    ) as JwtPayload;
    const user = await userModel.findById(decodedToken?._id);
    if (!user) {
      throw new ApiErrorHandler(401, "Invalid refresh token");
    }

    // check if incoming refresh token is same as the refresh token attached in the user document
    // This shows that the refresh token is used or not
    // Once it is used, we are replacing it with new refresh token below
    if (incomingRefreshToken !== user?.refreshToken) {
      // If token is valid but is used already
      throw new ApiErrorHandler(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken: newRefreshToken } =
      await generateRefreshTokenAccessToken(user._id);

    // Update the user's refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponseHandler(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error: any) {
    throw new ApiErrorHandler(401, error?.message || "Invalid refresh token");
  }
});
export { register, login, logOut, refreshAccessToken };
