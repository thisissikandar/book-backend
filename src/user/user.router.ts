import { Router } from "express";
import { login, register } from "./user.controller";



const userRouter = Router()
userRouter.route("/register").post(register)
userRouter.route("/login").post(login)

export default userRouter