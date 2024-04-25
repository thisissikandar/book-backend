import { Router } from "express";
import { register } from "./user.controller";



const router = Router()
router.route("/register").post(register)

export default router