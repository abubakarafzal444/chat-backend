const ChatRoom = require("../models/ChatRoom");
const Message = require("../models/Message");
const io = require("../socket");

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

const sendGroupMessage = async (req, res, next) => {
  const { message } = req.body;
  const receiver = req.params.chatRoomId;
  try {
    const messageObj = new Message({ from: req._id, to: receiver, message });
    const savedMessage = await messageObj.save();

    const populatedMessage = await savedMessage.populate("from", {
      userName: 1,
      email: 1,
      bio: 1,
      gender: 1,
      prfilePhoto: 1,
      city: 1,
      country: 1,
      lastOnline: 1,
    });

    io.getIO().emit(`chatRoomMessage/${receiver}`, {
      action: "NEW_MESSAGE",
      message: populatedMessage,
    });

    // io.getIO().on(`joinedRoom`, (data) => {
    //   console.log("joined log");
    //   if (data.action === "JOINED-ROOM") {
    //     io.getIO().emit(`roomJoined/${data.roomId}`, {
    //       action: "PERSON_JOINED",
    //       userName: data.userName,
    //     });
    //   }
    // });
    return res.status(201).json(savedMessage);
  } catch (error) {
    next(error);
  }
};

const getGroupMessages = async (req, res, next) => {
  const chatRoomId = req.params.chatRoomId;
  try {
    const messages = await Message.find()
      .where("to")
      .equals(chatRoomId)
      .sort({ timestamp: -1 })
      .limit(50);
    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};

exports.createChatRoom = createChatRoom;
exports.getTopRatedChatRooms = getTopRatedChatRooms;
exports.getGroupMessages = getGroupMessages;
exports.sendGroupMessage = sendGroupMessage;
