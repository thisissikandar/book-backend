import { body } from "express-validator";
import { AvailableUserRoles } from "../../constants";

const userRegisterValidator = () => {
    return [
      body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Email is invalid"),
      body("name")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLowercase()
        .withMessage("Username must be lowercase")
        .isLength({ min: 3 })
        .withMessage("Username must be at lease 3 characters long"),
      body("password").trim().notEmpty().withMessage("Password is required"),
      body("role")
        .optional()
        .isIn(AvailableUserRoles)
        .withMessage("Invalid user role"),
    ];
  };
  
  const userLoginValidator = () => {
    return [
      body("email").optional().isEmail().withMessage("Email is invalid"),
      body("username").optional(),
      body("password").notEmpty().withMessage("Password is required"),
    ];
  };
  


  export {
    userRegisterValidator,
    userLoginValidator,
 
  };