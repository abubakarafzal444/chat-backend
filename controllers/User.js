const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const customError = require("../util/customError");

const signUp = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ userName, password: hashed, coins: 50 });
    const savedUser = await user.save();

    const token = jwt.sign(
      {
        userName: userName,
        _id: savedUser._id,
      },
      process.env.JWT_DECODE_STRING,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      data: {
        userName: savedUser.userName,
        _id: savedUser._id,
        tokenInfo: {
          token,
          expiresOn: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        },
      },
      message: "New user has been added successfully",
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const dbUser = await User.findOne({ userName: req.body.userName });
    if (!dbUser) throw new customError("Entered username is incorrect!", 401);
    const compareResult = await bcrypt.compare(
      req.body.password,
      dbUser.password
    );
    if (!compareResult)
      throw new customError("Entered password is incorrect!", 401);
    const token = jwt.sign(
      {
        userName: dbUser.userName,
        _id: dbUser._id,
      },
      process.env.JWT_DECODE_STRING,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      tokenInfo: {
        token,
        expiresOn: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      },
      message: "Logged in successfully!",
      user: { userName: dbUser.userName },
    });
  } catch (e) {
    next(e);
  }
};

exports.signUp = signUp;
exports.login = loginUser;
