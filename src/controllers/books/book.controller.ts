import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import { CustomRequest } from "../../middlewares/authMiddleware";
import { deleteOnCloudinary, uploadOnCloudinary } from "../../utils/cloudinary";
import bookModel from "../../models/books/book.model";

const createBook = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { title, genre, author, description } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const coverImageFilePath = files.coverImage[0].path;
  const uploadResult = await uploadOnCloudinary(
    coverImageFilePath,
    "books-covers"
  );

  const bookPdfFilePath = files.file[0].path;

  const bookPdfFileUploadResult = await uploadOnCloudinary(
    bookPdfFilePath,
    "books-pdfs"
  );
  const newBook = await bookModel.create({
    title,
    genre,
    author,
    description,
    owner: req.user._id,
    coverImage: uploadResult?.secure_url,
    file: bookPdfFileUploadResult?.secure_url,
  });

  return res.send(newBook);
};

const updateBook = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { title, genre, author, description } = req.body;
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "book Not found"));
  }

  if (String(book.owner._id) !== String(req.user._id)) {
    return next(
      createHttpError(403, "Unauthorized, You can not update others book")
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  // cover Image Update
  let completeCoverImage;
  if (files.coverImage) {
    const coverImagefilePath = files.coverImage[0].path;
    const uploadResult = await uploadOnCloudinary(
      coverImagefilePath,
      "books-covers"
    );
    completeCoverImage = uploadResult?.secure_url;
  }

  // Book File Name Update
  let completeFile;
  if (files.file) {
    const bookPdfFilePath = files.file[0].path;

    const bookFileUploadResult = await uploadOnCloudinary(
      bookPdfFilePath,
      "books-pdfs"
    );
    completeFile = bookFileUploadResult?.secure_url;
  }
  const updatedBook = await bookModel.findOneAndUpdate(
    { _id: bookId },
    {
      title,
      genre,
      author,
      description,
      owner: req.user?._id,
      coverImage: completeCoverImage ? completeCoverImage : book?.coverImage,
      file: completeFile ? completeFile : book.file,
    }
  );
  return res.send(updatedBook);
};

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  const allBook = await bookModel.find();
  if (!allBook) {
    return next(createHttpError(404, "book Not found"));
  }

  return res.send(allBook);
};

const getSingleBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  const singleBook = await bookModel.findOne({ _id: bookId });
  if (!singleBook) {
    return next(createHttpError(404, "book Not found"));
  }

  return res.json(singleBook);
};

const deleteSingleBooks = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;
  const singleBook = await bookModel.findOne({ _id: bookId });
  if (!singleBook) {
    return next(createHttpError(404, "book Not found"));
  }

  if (String(singleBook.owner?._id) !== String(req.user?._id)) {
    return next(
      createHttpError(403, "Unauthorized, You can not delete others book")
    );
  }

  const coverImageString = singleBook.coverImage.split("/");
  const coverImagePublicId =
    coverImageString.at(-2) + "/" + coverImageString.at(-1)?.split(".").at(-2);

  const pdfFileString = singleBook.file.split("/");
  const pdfFilePublicId =
    pdfFileString.at(-2) + "/" + pdfFileString.at(-1)?.split(".").at(-2);

  await deleteOnCloudinary(coverImagePublicId);
  await deleteOnCloudinary(pdfFilePublicId);

  const deleted = await bookModel.deleteOne({ _id: bookId });
  console.log(deleted);

  return res.send({ message: `Successfully deleted ${singleBook.title}` });
};

export {
  createBook,
  updateBook,
  getAllBooks,
  getSingleBooks,
  deleteSingleBooks,
};
