const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const customError = require("../util/customError");

const signUp = async (req, res, next) => {
  const { userName, password: pass } = req.body;
  try {
    const hashed = await bcrypt.hash(pass, 12);
    const user = new User({ userName, password: hashed });
    const savedUser = await user.save();

    const token = jwt.sign(
      {
        userName: userName,
        _id: savedUser._id,
      },
      process.env.JWT_DECODE_STRING,
      { expiresIn: "1d" }
    );
    const { password, ...savedUserData } = savedUser._doc;
    return res.status(201).json({
      data: {
        user: savedUserData,
        tokenInfo: {
          token,
          userId: savedUser._id,
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
    const { password, ...userData } = dbUser._doc;
    return res.status(200).json({
      tokenInfo: {
        token,
        expiresOn: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
        userId: dbUser._id,
      },
      message: "Logged in successfully!",
      user: userData,
    });
  } catch (e) {
    next(e);
  }
};

const getUserData = async (req, res, next) => {
  try {
    const user = await User.findById(req._id);
    const { password, ...data } = user._doc;
    return res.status(200).json(data);
  } catch (e) {
    next(e);
  }
};

const sendFriendRequest = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const myUser = await User.findByIdAndUpdate(
      req._id,
      { $push: { sentRequests: userId } },
      { new: true, upsert: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $push: { friendRequests: req._id } },
      { new: true, upsert: true }
    );

    const { password, ...data } = myUser._doc;
    return res.status(201).json(data);
  } catch (e) {
    next(e);
  }
};

const cancelRequest = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const myUser = await User.findByIdAndUpdate(
      req._id,
      { $pull: { sentRequests: userId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $pull: { friendRequests: req._id } },
      { new: true }
    );
    const { password, ...data } = myUser._doc;
    return res.status(201).json(data);
  } catch (e) {
    next(e);
  }
};

const acceptRequest = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const myUser = await User.findByIdAndUpdate(
      req._id,
      { $pull: { friendRequests: userId }, $push: { friends: userId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $pull: { sentRequests: req._id }, $push: { friends: req._id } },
      { new: true }
    );
    const { password, ...data } = myUser._doc;
    return res.status(201).json(data);
  } catch (e) {
    next(e);
  }
};

const unfriend = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const myUser = await User.findByIdAndUpdate(
      req._id,
      { $pull: { friends: userId } },
      { new: true }
    );
    await User.findByIdAndUpdate(
      userId,
      { $pull: { friends: req._id } },
      { new: true }
    );
    const { password, ...data } = myUser._doc;
    return res.status(201).json(data);
  } catch (e) {
    next(e);
  }
};

const getUsersDataByIds = async (req, res, next) => {
  const { idsArray } = req.body;
  if (idsArray.length === 0) return res.status(200).json([]);
  try {
    const people = await User.find({
      _id: {
        $in: [...idsArray],
      },
    }).select("userName about gender prfilePhoto city  lastOnline");

    return res.status(201).json(people);
  } catch (e) {
    next(e);
  }
};

exports.signUp = signUp;
exports.login = loginUser;
exports.sendFriendRequest = sendFriendRequest;
exports.getUserData = getUserData;
exports.cancelRequest = cancelRequest;
exports.acceptRequest = acceptRequest;
exports.unfriend = unfriend;
exports.getUsersDataByIds = getUsersDataByIds;
