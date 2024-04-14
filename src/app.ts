import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ messagee: "hello world server is listening" });
});

export default app;
