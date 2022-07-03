const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const validateSignUp = [
  body("userName").trim().notEmpty().withMessage("Username cannot be empty!"),
  body("password").trim().notEmpty().withMessage("Password cannot be empty!"),
  body("confirmPassword")
    .trim()
    .notEmpty()
    .withMessage("Confirm password cannot be empty!"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) return false;
      else return true;
    })
    .withMessage("Passwords do not match"),

  async (req, res, next) => {
    const errors = validationResult(req.body.userName);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Entered Form data is incorrect",
        errorsArray: errors.array(),
      });
    }
    const dbUser = await User.findOne({ userName: req.body.userName });
    if (dbUser)
      return res.status(422).json({ message: "Username already exists" });
    else next();
  },
];
module.exports = validateSignUp;
