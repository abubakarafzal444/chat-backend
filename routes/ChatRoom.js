const express = require("express");
const router = express.Router();
const validateChatRoomCreation = require("../validators/validateChatRoomCreation");
const createChatRoom = require("../controllers/ChatRoom").createChatRoom;
const getTopRatedChatRooms =
  require("../controllers/ChatRoom").getTopRatedChatRooms;
const sendGroupMessage = require("../controllers/ChatRoom").sendGroupMessage;
const getGroupMessages = require("../controllers/ChatRoom").getGroupMessages;
const Authenticate = require("../middlewares/Authenticate");
const validateUserMessages = require("../validators/validateUserMessage");

router.post(
  "/createChatRoom",
  Authenticate,
  validateChatRoomCreation,
  createChatRoom
);

router.get("/getChatRooms/topRated", getTopRatedChatRooms);

router.get("/getGroupMessages/:chatRoomId", Authenticate, getGroupMessages);

router.post(
  `/sendGroupMessage/:chatRoomId`,
  Authenticate,
  validateUserMessages,
  sendGroupMessage
);

// router.get("/user/:userId", Authenticate, getMessages);

module.exports = router;
