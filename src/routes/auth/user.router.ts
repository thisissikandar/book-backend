import { Router } from "express";
import {
  login,
  logOut,
  refreshAccessToken,
  register,
} from "../../controllers/auth/user.controller";
import { validate } from "../../validator/validate";
import {
  userLoginValidator,
  userRegisterValidator,
} from "../../validator/auth/user.validator";
import { verifyJWT } from "../../middlewares/authMiddleware";

const userRouter = Router();
// userRouter.use(validate)
userRouter.route("/register").post(userRegisterValidator(), validate, register);
userRouter.route("/login").post(userLoginValidator(), validate, login);
userRouter.route("/logout").post(verifyJWT, logOut);
userRouter.route("/refresh-token").post(refreshAccessToken);

export default userRouter;
