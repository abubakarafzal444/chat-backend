const { body, validationResult } = require("express-validator");
const validateChatRoomCreation = [
  body("name").trim().notEmpty().withMessage("group name cannot be empty"),

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
module.exports = validateChatRoomCreation;
