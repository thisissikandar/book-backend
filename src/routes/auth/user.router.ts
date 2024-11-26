import { Router } from "express";
import { login, logOut, register } from "../../controllers/auth/user.controller";
import { validate } from "../../validator/validate";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../../validator/auth/user.validator";
import { verifyJWT } from "../../middlewares/authMiddleware";

const userRouter = Router();
userRouter.route("/register").post(userRegisterValidator(), validate, register);
userRouter.route("/login").post(userLoginValidator(), validate, login);
userRouter.route("/logout").post(verifyJWT, logOut);

export default userRouter;
