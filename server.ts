import app from "./src/app";
import { config } from "./src/config/config";
import connectDb from "./src/config/connectionDb";

const startServer = async () => {
  try {
    await connectDb();
    const port = config.port || 3000;
    app.on("error", (err) => {
      console.log("Error: ", err);
      throw err;
    });
    app.listen(port, () => {
      console.log(`App Running on port :: http://localhost:${port}`);
    });
  } catch (error: any) {
    console.log("MONGO DB Connection Failed:", error);
    throw error
  }
};
startServer();
