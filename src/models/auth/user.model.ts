import bcrypt from "bcrypt";
import mongoose, { Schema } from "mongoose";
import { User } from "../../types/user.type";
import { sign } from "jsonwebtoken";
import { config } from "../../config/config";
import { AvailableUserRoles, UserRolesEnum } from "../../constants";

const userSchema = new Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: AvailableUserRoles,
      default: UserRolesEnum.USER,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    password: {
      type: String,
      required: [true,"password is required"],
    },
  },
  { timestamps: true }
);
userSchema.pre<User>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateAccessToken =function () {
  return sign(
    { _id: this._id, email: this.email, role: this.role },
    config.jwtAccessTokenSecret as string,
    {
      expiresIn: config.jwtAccessTokenExpiry,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return sign(
    { _id: this._id },
    config.jwtRefreshTokenSecret as string,
    {
      expiresIn: config.jwtRefreshTokenExpiry,
    }
  );
};

export default mongoose.model<User>("User", userSchema);
