import { Router } from "express";
import { verifyJWT } from "../../middlewares/authMiddleware";
import { upload } from "../../middlewares/multerMiddleware";
import {
  createBook,
  deleteSingleBooks,
  getAllBooks,
  getSingleBooks,
  updateBook,
} from "../../controllers/books/book.controller";
import { validate } from "../../validator/validate";
import { mongoIdPathVariableValidator } from "../../validator/common/mongodb.validator";

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
  mongoIdPathVariableValidator("bookId"),
  validate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);
bookRouter.route("/").get(getAllBooks);
bookRouter.route("/:bookId").get(getSingleBooks);
bookRouter
  .route("/:bookId")
  .delete(
    verifyJWT,
    mongoIdPathVariableValidator("bookId"),
    validate,
    deleteSingleBooks
  );

export default bookRouter;
