import { Router } from "express";
import multer from "multer";
import path from "path";
import { createBook, deleteSingleBooks, getAllBooks, getSingleBooks, updateBook } from "./book.controller";
import { verifyJWT } from "../middlewares/authMiddleware";

const bookRouter = Router();

const upload = multer({
  dest: path.join(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 },
});
bookRouter.route("/").post(
  verifyJWT,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);
bookRouter.route("/:bookId").patch(
  verifyJWT,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);
bookRouter.route("/").get(getAllBooks);
bookRouter.route("/:bookId").get(getSingleBooks);
bookRouter.route("/:bookId").delete(verifyJWT,deleteSingleBooks);

export default bookRouter;
