const express = require("express");
const router = express.Router();
const validateSignUp = require("../validators/validateSignUp");
const validateLogin = require("../validators/validateLogin");
const signUp = require("../controllers/User").signUp;
const loginUser = require("../controllers/User").login;

//POST ./add-user
router.post("/signup", validateSignUp, signUp);

router.post("/login", validateLogin, loginUser);

module.exports = router;
