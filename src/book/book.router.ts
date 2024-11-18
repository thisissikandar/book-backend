import { Router } from "express";

import {
  createBook,
  deleteSingleBooks,
  getAllBooks,
  getSingleBooks,
  updateBook,
} from "./book.controller";
import { verifyJWT } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multerMiddleware";

const bookRouter = Router();

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
bookRouter.route("/:bookId").delete(verifyJWT, deleteSingleBooks);

export default bookRouter;
