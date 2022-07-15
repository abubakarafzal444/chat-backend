const express = require("express");
const router = express.Router();
const validateUserMessages = require("../validators/validateUserMessage");
const userMessage = require("../controllers/Messages").userMessage;
const getMessages = require("../controllers/Messages").getMessages;

const Authenticate = require("../middlewares/Authenticate");

router.post("/user/:userId", Authenticate, validateUserMessages, userMessage);

router.get("/user/:userId", Authenticate, getMessages);

module.exports = router;
