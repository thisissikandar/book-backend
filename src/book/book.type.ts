import { User } from "../user/user.type";

export interface Book {
  _id: string;
  title: string;
  owner:User
  author: string;
  genre: string;
  description:string
  coverImage: string;
  file: string;
}
