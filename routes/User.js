const express = require("express");
const router = express.Router();
const validateSignUp = require("../validators/validateSignUp");
const validateLogin = require("../validators/validateLogin");
const signUp = require("../controllers/User").signUp;
const loginUser = require("../controllers/User").login;

// import { loginUser, addUser } from "../controllers/User";
// import validateAddUser from "../validators/add-user-validator";
// import validateLogin from "../validators/login-validator";

//POST ./add-user
router.post("/signup", validateSignUp, signUp);

router.post("/login", validateLogin, loginUser);

module.exports = router;
