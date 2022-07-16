const Message = require("../models/Message");
const User = require("../models/User");
var ObjectId = require("mongoose").Types.ObjectId;

const getMessages = async (req, res, next) => {
  const user = req.params.userId;
  try {
    if (!ObjectId.isValid(user)) throw new Error("not found");
    const userExist = await User.exists({ _id: user });
    if (!userExist) throw new Error("not found");

    const messages = await Message.find({
      $or: [
        { from: user, to: req._id },
        { from: req._id, to: user },
      ],
    })
      .populate([
        {
          path: "from",
          select:
            "userName email bio gender profilePhoto city country lastOnline",
        },
        {
          path: "to",
          select:
            "userName email bio gender profilePhoto city country lastOnline",
        },
      ])
      .sort({ timestamp: -1 });
    return res.status(200).json(messages);
  } catch (error) {
    if (error.message === "not found") {
      return res.status(404).json({ message: "No data found for this url" });
    } else next(error);
  }
};

exports.getMessages = getMessages;
