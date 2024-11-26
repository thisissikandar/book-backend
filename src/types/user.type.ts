import { Document } from "mongoose";

export interface User extends Document{
  _id: string;
  name: string;
  email: string;
  role: string;
  refreshToken: string;
  password: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}
