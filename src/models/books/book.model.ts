import mongoose, { Schema } from "mongoose";
import { Book } from "../../types/book.type";

const bookSchema = new Schema<Book>(
  {
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      required: true,
    },
    file: {
      type: String,
      required: true,
    },
  
  },
  { timestamps: true }
);

export default mongoose.model<Book>("Book", bookSchema);
