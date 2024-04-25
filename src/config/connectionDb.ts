import mongoose from "mongoose";
import { config } from "./config";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("☘️☘️🍁🍀 Database connected Successfully !!");
    });
    mongoose.connection.on("error", (err) => {
      console.log("Database error: " + err);
    });
    const connectionInstance = await mongoose.connect (config.databaseUrl as string);
    // connectionInstance.connection.on("connected", () => {
    //   console.log("Connected to database");
    // });
    // connectionInstance.connection.on("error", (err) => {
    //   console.log("Database error: " + err);
    // });
 
  } catch (error) {
    console.log(error);
    process.exit();
  }
};
export default connectDb;
