import dotenv from "dotenv";
dotenv.config()
const _config = {
  port: process.env.APP_PORT,
};

export const config = Object.freeze(_config);
