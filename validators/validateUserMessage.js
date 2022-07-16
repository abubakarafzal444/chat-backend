const { body, validationResult } = require("express-validator");
const validateSignUp = [
  body("message").trim().notEmpty().withMessage("message cannot be empty"),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        message: "Entered Form data is incorrect",
        errorsArray: errors.array(),
      });
    }
    next();
  },
];
module.exports = validateSignUp;
