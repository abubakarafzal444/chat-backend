const User = require("../models/User");
var ObjectId = require("mongoose").Types.ObjectId;

const topRated = async (req, res, next) => {
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
    if (!ObjectId.isValid(userId)) throw new Error("not found");
    const userExist = await User.exists({ _id: userId });
    if (!userExist) throw new Error("not found");

    const user = await User.findById(userId);
    const { friends, isOnApp, password, ...data } = user;
    return res.status(200).json(data);
  } catch (error) {
    if (error.message === "not found") {
      return res.status(404).json({ message: "No data found for this url" });
    } else next(error);
  }
};

exports.topRated = topRated;
exports.userProfile = userProfile;
