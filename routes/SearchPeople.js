const express = require("express");
const router = express.Router();
const Authenticate = require("../middlewares/Authenticate");
const topRatedController = require("../controllers/SearchPeople").topRated;
const userProfile = require("../controllers/SearchPeople").userProfile;

// const loginUser = require("../controllers/SearchPeople").login;
// ./find-matches/
router.get("/top-rated", topRatedController);

router.get("/user/:id/profile", Authenticate, userProfile);
// router.post("/login", validateLogin, loginUser);

module.exports = router;
