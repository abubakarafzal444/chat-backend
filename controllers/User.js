const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const signUp = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 12);
    const user = new User({ userName, password: hashed });
    const savedUser = await user.save();
    return res.status(201).json({
      data: {
        userName: savedUser.userName,
        _id: savedUser._id,
      },
      message: "New user has been added successfully",
    });
  } catch (error) {
    throw new Error({
      status: 500,
      message: "Something went wrong! Please try again later!",
    });
  }
};

const loginUser = async (req, res, next) => {
  try {
    const dbUser = await User.findOne({ userName: req.body.userName });
    if (!dbUser) throw new Error("Entered username is incorrect!");
    const compareResult = await bcrypt.compare(
      req.body.password,
      dbUser.password
    );
    if (!compareResult) throw new Error("Entered password is incorrect!");
    const token = jwt.sign(
      {
        userName: dbUser.userName,
        _id: dbUser._id,
      },
      process.env.JWT_DECODE_STRING,
      { expiresIn: "1d" }
    );
    return res.status(200).json({
      token: token,
      message: "Logged in successfully!",
      user: { userName: dbUser.userName },
    });
  } catch (e) {
    next(e);
  }
};

exports.signUp = signUp;
exports.login = loginUser;
