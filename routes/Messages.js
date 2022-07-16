const express = require("express");
const router = express.Router();
const getMessages = require("../controllers/Messages").getMessages;

const Authenticate = require("../middlewares/Authenticate");

router.get("/user/:userId", Authenticate, getMessages);

module.exports = router;
