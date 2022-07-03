const { body, validationResult } = require("express-validator");

const validateLogin = [
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

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Entered Form data is incorrect",
        errorsArray: errors.array(),
      });
    } else next();
  },
];

module.exports = validateLogin;
