const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
var ObjectId = require("mongoose").Types.ObjectId;

const createChatRoom = async (req, res, next) => {
  const { name } = req.body;
  try {
    const room = new ChatRoom({ name, owner: req._id, isDefault: false });
    const savedChatRoom = await room.save();

    return res.status(201).json(savedChatRoom);
  } catch (error) {
    next(error);
  }
};

const getTopRatedChatRooms = async (req, res, next) => {
  try {
    const chatRooms = await ChatRoom.find()
      .populate("owner", {
        userName: 1,
        email: 1,
        bio: 1,
        gender: 1,
        prfilePhoto: 1,
        city: 1,
        country: 1,
        lastOnline: 1,
      })
      .limit(10)
      .sort("-clicks");
    return res.status(200).json(chatRooms);
  } catch (error) {
    next(error);
  }
};

const getGroupMessages = async (req, res, next) => {
  console.log("getgroupmessages");
  const chatRoomId = req.params.chatRoomId;
  try {
    if (!ObjectId.isValid(chatRoomId)) throw new Error("not found");
    const roomExist = await ChatRoom.exists({ _id: chatRoomId });
    if (!roomExist) throw new Error("not found");

    const messages = await Message.find()
      .populate("from", {
        userName: 1,
        email: 1,
        bio: 1,
        gender: 1,
        prfilePhoto: 1,
        city: 1,
        country: 1,
        lastOnline: 1,
      })
      .where("to")
      .equals(chatRoomId)
      .sort({ timestamp: -1 })
      .limit(50);
    return res.status(200).json(messages);
  } catch (error) {
    if (error.message === "not found") {
      return res.status(404).json({ message: "No data found for this url" });
    } else next(error);
  }
};

exports.createChatRoom = createChatRoom;
exports.getTopRatedChatRooms = getTopRatedChatRooms;
exports.getGroupMessages = getGroupMessages;
