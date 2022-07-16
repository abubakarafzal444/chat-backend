const Message = require("../models/Message");
const io = require("../socket");

const userMessage = async (req, res, next) => {
  const { message } = req.body;
  const receiver = req.params.userId;
  try {
    const messageObj = new Message({ from: req._id, to: receiver, message });
    const savedMessage = await messageObj.save();

    const messagesCount = await Message.find({
      $or: [
        { from: req._id, to: receiver },
        { from: receiver, to: req._id },
      ],
    }).countDocuments();

    if (messagesCount > 20) {
      const deletedMessage = await Message.findOneAndDelete({
        $or: [
          { from: req._id, to: receiver },
          { from: receiver, to: req._id },
        ],
      }).sort({ timestamp: 1 });
      console.log(deletedMessage);
    }
    io.getIO().emit(`userMessage/${req._id}`, {
      action: "NEW_MESSAGE",
      message: savedMessage,
    });
    const populatedMessage = await savedMessage.populate([
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
    ]);
    return res.status(200).json(populatedMessage);
  } catch (error) {
    next(error);
  }
};

const getMessages = async (req, res, next) => {
  const user = req.params.userId;
  try {
    const messages = await Message.find({
      $or: [
        { from: user, to: req._id },
        { from: req._id, to: user },
      ],
    }).sort({ timestamp: -1 });
    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

exports.userMessage = userMessage;
exports.getMessages = getMessages;
