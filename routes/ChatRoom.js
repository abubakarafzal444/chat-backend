const express = require("express");
const router = express.Router();
const validateChatRoomCreation = require("../validators/validateChatRoomCreation");
const createChatRoom = require("../controllers/ChatRoom").createChatRoom;
const getTopRatedChatRooms =
  require("../controllers/ChatRoom").getTopRatedChatRooms;
const getGroupMessages = require("../controllers/ChatRoom").getGroupMessages;
const Authenticate = require("../middlewares/Authenticate");

router.post(
  "/createChatRoom",
  Authenticate,
  validateChatRoomCreation,
  createChatRoom
);

router.get("/getChatRooms/topRated", getTopRatedChatRooms);

router.get("/getGroupMessages/:chatRoomId", Authenticate, getGroupMessages);

module.exports = router;
