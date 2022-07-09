const express = require("express");
const router = express.Router();
const Authenticate = require("../middlewares/Authenticate");
const topRatedController = require("../controllers/SearchPeople").topRated;
// const loginUser = require("../controllers/SearchPeople").login;
// ./find-matches/
router.get("/top-rated", topRatedController);

// router.post("/login", validateLogin, loginUser);

module.exports = router;
