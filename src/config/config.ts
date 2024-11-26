import dotenv from "dotenv";
dotenv.config()
const _config = {
  port: process.env.APP_PORT,
  databaseUrl: process.env.MONGO_URI,
  env: process.env.NODE_ENV,
  jwtAccessTokenSecret:process.env.JWT_ACCESSTOKEN_SECRET,
  jwtAccessTokenExpiry:process.env.JWT_ACCESSTOKEN_EXPIRY,
  jwtRefreshTokenSecret:process.env.JWT_REFRESHTOKEN_SECRET,
  jwtRefreshTokenExpiry:process.env.JWT_REFRESHTOKEN_EXPIRY,
  cloudinaryCloudName:process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET,
  corsOrigins: process.env.CORS_ORIGINS,
};

export const config = Object.freeze(_config);
