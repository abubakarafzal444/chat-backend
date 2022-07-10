const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const topRated = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const users = await User.find()
      .limit(10)
      .sort("-profileClicks")
      .select(
        "userName bio about gender prfilePhoto city profileClicks lastOnline"
      );
    return res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

const userProfile = async (req, res, next) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    const { friends, isOnApp, password, ...data } = user;
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.topRated = topRated;
exports.userProfile = userProfile;
