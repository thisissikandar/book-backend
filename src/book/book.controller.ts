import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "path";
import bookModel from "./book.model";
import fs from "fs";
import { CustomRequest } from "../middlewares/authMiddleware";
import createHttpError from "http-errors";

const createBook = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
  const fileName = files.coverImage[0].filename;
  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );
  const uploadResult = await cloudinary.uploader.upload(filePath, {
    filename_override: fileName,
    resource_type: "auto",
    folder: "books-covers",
    format: coverImageMimeType,
  });
  const bookFileName = files.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );

  const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
    resource_type: "auto",
    filename_override: bookFileName,
    folder: "books-pdfs",
    format: "pdf",
  });
  const newBook = await bookModel.create({
    title,
    genre,
    author: req.user._id,
    coverImage: uploadResult.secure_url,
    file: bookFileUploadResult.secure_url,
  });

  await fs.promises.unlink(filePath);
  await fs.promises.unlink(bookFilePath);
  return res.send(newBook);
};

const updateBook = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;
  const book = await bookModel.findOne({ _id: bookId });
  if (!book) {
    return next(createHttpError(404, "book Not found"));
  }

  if (String(book.author._id) !== String(req.user._id)) {
    return next(
      createHttpError(403, "Unauthorized, You can not update others book")
    );
  }

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  // cover Image Update
  let completeCoverImage = "";
  if (files.coverImage) {
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      resource_type: "auto",
      folder: "books-covers",
      format: coverImageMimeType,
    });
    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  // Book File Name Update
  let completeFile = "";
  if (files.file) {
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "auto",
        filename_override: bookFileName,
        folder: "books-pdfs",
        format: "pdf",
      }
    );
    completeFile = bookFileUploadResult.secure_url;

    await fs.promises.unlink(bookFilePath);
  }
  const updatedBook = await bookModel.findOneAndUpdate(
    { _id: bookId },
    {
      title,
      genre,
      author: req.user._id,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
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

  if (String(singleBook.author._id) !== String(req.user._id)) {
    return next(
      createHttpError(403, "Unauthorized, You can not delete others book")
    );
  }
  const coverFileSplit = singleBook.coverImage.split("/");

  const coverImagePublicId =
    coverFileSplit.at(-2) + "/" + coverFileSplit.at(-1)?.split(".").at(-2);

  const bookFileSplit = singleBook.coverImage.split("/");

  const bookFilePublicId =
    bookFileSplit.at(-2) + "/" + bookFileSplit.at(-1)?.split(".").at(-2);
  await cloudinary.uploader.destroy(coverImagePublicId);
  await cloudinary.uploader.destroy(bookFilePublicId, {
    resource_type: "raw",
  });

  await bookModel.deleteOne({ _id: bookId });
  return res.status(204).json(singleBook._id);
};

export {
  createBook,
  updateBook,
  getAllBooks,
  getSingleBooks,
  deleteSingleBooks,
};
