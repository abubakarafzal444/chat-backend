const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const validateSignUp = [
  body("userName")
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 15 })
    .withMessage(
      "Username cannot be empty and should be 5 to 15 characters long!"
    ),
  body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 5 })
    .withMessage("Password cannot be empty and less than 5 characters!"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) return false;
      else return true;
    })
    .withMessage("Passwords do not match"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Entered Form data is incorrect",
        errorsArray: errors.array(),
      });
    }
    const dbUser = await User.findOne({ userName: req.body.userName });
    if (dbUser)
      return res.status(422).json({ message: "Username already exists" });
    next();
  },
];
module.exports = validateSignUp;
