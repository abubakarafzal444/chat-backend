const express = require("express");
const router = express.Router();
const validateSignUp = require("../validators/validateSignUp");
const validateLogin = require("../validators/validateLogin");
const Authenticate = require("../middlewares/Authenticate");
const signUp = require("../controllers/User").signUp;
const loginUser = require("../controllers/User").login;
const getUserData = require("../controllers/User").getUserData;
const cancelRequest = require("../controllers/User").cancelRequest;
const acceptRequest = require("../controllers/User").acceptRequest;
const unfriend = require("../controllers/User").unfriend;

const sendFriendRequest = require("../controllers/User").sendFriendRequest;
const getUsersDataByIds = require("../controllers/User").getUsersDataByIds;

router.post("/signup", validateSignUp, signUp);

router.post("/login", validateLogin, loginUser);

router.get("/getUserData", Authenticate, getUserData);

//Friend request routes
router.post("/sendFriendRequest/:userId", Authenticate, sendFriendRequest);

router.post("/cancelRequest/:userId", Authenticate, cancelRequest);

router.post("/acceptRequest/:userId", Authenticate, acceptRequest);

router.post("/unfriend/:userId", Authenticate, unfriend);

router.post("/getUsersDataByIds", Authenticate, getUsersDataByIds);

module.exports = router;
