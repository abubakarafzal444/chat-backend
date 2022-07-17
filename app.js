require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(cors());
const jwt = require("jsonwebtoken");

const userRoutes = require("./routes/User");
const SearchPeople = require("./routes/SearchPeople");
const chats = require("./routes/Messages");
const chatRoom = require("./routes/ChatRoom");
const multerMiddleware = require("./middlewares/multer-config");
const Message = require("./models/Message");
const User = require("./models/User");

const server = http.createServer(app);

var connectedUsers = {};

const io = new Server(server, {
  allowEIO3: true,
  cors: {
    origin: true,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const tokenObj = JSON.parse(token);
    const payload = jwt.verify(tokenObj.token, process.env.JWT_DECODE_STRING);
    if (!payload) throw new Error("authentication failed");
    socket.userId = payload._id;
    socket.userName = payload.userName;
    next();
  } catch (err) {
    console.log(err);
  }
});

io.on("connection", async (socket) => {
  console.log("client connected", socket.userId);
  connectedUsers[socket.userId] = socket;
  console.log("connected", connectedUsers);
  //online status for friends
  try {
    const userObj = await User.findById(socket.userId);
    let onlineFriendsArr = [];
    userObj.friends.forEach((f) => {
      if (connectedUsers[f]) {
        onlineFriendsArr.push(connectedUsers[f].id);
      }
    });
    socket.to(onlineFriendsArr).emit(`friendOnlineStatus`, {
      action: "FRIEND_ONLINE",
      userId: socket.userId,
    });
    userObj.lastOnline = "online";
    await userObj.save();
    // await User.findByIdAndUpdate(socket.userId, {
    //   lastOnline: "online",
    // });
    const messages = await Message.find({ to: socket.userId, status: "sent" });
    messages.forEach((m) => {
      if (connectedUsers[m.from]) {
        socket.to(connectedUsers[m.from].id).emit(`messageDelivered`, {
          action: "MESSAGE_DELIVERED",
          message: m,
          userId: m.to,
        });
      }
    });
    const textedUsersMessages = await Message.find({
      to: socket.userId,
      status: "sent",
    });
    let onlineTextedUsers = [];
    textedUsersMessages.forEach((m) => {
      if (connectedUsers[m.from]) {
        onlineTextedUsers.push(connectedUsers[m.from].id);
      }
    });
    if (onlineTextedUsers.length > 0) {
      socket.to(onlineTextedUsers).emit("messageBeingDelivered", {
        userId: socket.userId,
      });
    }
    console.log("textedUsersMessages", textedUsersMessages);
    //todo

    await Message.updateMany(
      { to: socket.userId, status: "sent" },
      { status: "delivered" }
    );

    console.log(
      "active users after connect",
      Object.keys(connectedUsers).length
    );
  } catch (e) {
    console.log(e);
  }
  socket.on("disconnect", async () => {
    try {
      console.log("Client disconnected", socket.userId);

      delete connectedUsers[socket.userId];

      console.log("disconnected", connectedUsers);

      const userObj = await User.findById(socket.userId);

      let onlineFriendsArr = [];
      userObj.friends.forEach((f) => {
        if (connectedUsers[f]) {
          onlineFriendsArr.push(connectedUsers[f].id);
        }
      });
      socket.to(onlineFriendsArr).emit(`friendOnlineStatus`, {
        action: "FRIEND_OFFLINE",
        userId: socket.userId,
      });

      userObj.lastOnline = new Date().toString();
      await userObj.save();
      // await User.findByIdAndUpdate(socket.userId, {
      //   lastOnline: new Date().toString(),
      // });
      console.log(
        "active users after disconnect",
        Object.keys(connectedUsers).length
      );
    } catch (e) {
      console.log(e);
    }
  });

  socket.on("openedChat", async (data) => {
    try {
      socket.join(data.userId);
      console.log("opened chat");
      if (connectedUsers[data.userId]?.id) {
        socket
          .to(connectedUsers[data.userId]?.id)
          .emit("messageBeingRead", { userId: socket.userId });
      }
      await Message.updateMany(
        {
          from: data.userId,
          to: socket.userId,
          status: "delivered",
        },
        { status: "read" }
      );
    } catch (e) {
      console.log(e);
    }
  });
  socket.on("closedChat", (data) => {
    socket.leave(data.userId);
    console.log("closed chat");
  });

  socket.on("joinedRoom", (data) => {
    if (data.action === "JOINED-ROOM") socket.join(data.roomId);
    console.log(data.userName, "joined chatroom: " + data.roomId);
    socket.to(data.roomId).emit(`roomJoined/${data.roomId}`, {
      action: "PERSON_JOINED",
      userName: data.userName,
    });
  });

  socket.on("leftRoom", (data) => {
    if (data.action === "LEFT-ROOM") socket.leave(data.roomId);
    console.log(data.userName, "left chatroom: " + data.roomId);
    socket.to(data.roomId).emit(`roomLeft/${data.roomId}`, {
      action: "PERSON_LEFT",
      userName: data.userName,
    });
  });

  socket.on("sendingNewMsg", async (data) => {
    if (data.message.trim().length > 0) {
      try {
        const messageObj = new Message({
          from: socket.userId,
          to: data.roomId,
          message: data.message,
        });
        const savedMessage = await messageObj.save();

        const messagesCount = await Message.find({
          to: data.roomId,
        }).countDocuments();

        if (messagesCount > 1000) {
          const deletedMessage = await Message.findOneAndDelete({
            to: data.roomId,
          }).sort({ timestamp: 1 });
        }

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
        socket.to(data.roomId).emit(`chatRoomMessage`, {
          action: "NEW_MESSAGE",
          message: populatedMessage,
        });
        socket.emit(`chatRoomMessage`, {
          action: "MY_MESSAGE",
          message: populatedMessage,
        });
      } catch (e) {
        console.log(e);
        socket.emit("chatRoomMessage", {
          action: "SEND_ERROR",
          message: {
            message: data.message,
            from: { _id: socket.userId },
            to: { _id: data.roomId },
          },
        });
      }
    }
  });

  socket.on("sendingPersonalMsg", async (data) => {
    try {
      if (data.message.trim().length > 0) {
        console.log("new message in chat");
        let status = "sent";
        const recieverSocket = connectedUsers[data.to];

        if (recieverSocket) {
          console.log("rooms", recieverSocket.rooms);
          if (recieverSocket.rooms.has(socket.userId)) status = "read";
          else status = "delivered";
        }

        // if (socket.rooms.hasOwnProperty()) status = "read";
        const messageObj = new Message({
          from: socket.userId,
          to: data.to,
          message: data.message,
          status,
        });
        const savedMessage = await messageObj.save();

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
        if (connectedUsers[data.to]) {
          socket
            .to(connectedUsers[data.to].id)
            .emit(`newPersonalMessage/${socket.userId}`, {
              action: "NEW_MESSAGE",
              message: populatedMessage,
            });
        }
        socket.emit("newPersonalMessage", {
          action: "MY_MESSAGE",
          message: populatedMessage,
        });
        //
        const messagesCount = await Message.find({
          $or: [
            { from: socket.userId, to: data.to },
            { from: data.to, to: socket.userId },
          ],
        }).countDocuments();

        if (messagesCount > 20) {
          const deletedMessage = await Message.findOneAndDelete({
            $or: [
              { from: socket.userId, to: data.to },
              { from: data.to, to: socket.userId },
            ],
          }).sort({ timestamp: 1 });
        }
      }
    } catch (e) {
      console.log(e);
      socket.emit("newPersonalMessage", {
        action: "SEND_ERROR",
        message: {
          message: data.message,
          from: { _id: socket.userId },
          to: { _id: data.to },
          status: "Error",
        },
      });
    }
  });
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Content-Type,Authorization"
  );
  next();
});

//body-parser middleware
app.use(bodyParser.json());

//multer for file parsing
app.use(multerMiddleware);

app.use(userRoutes);

app.use("/find-matches", SearchPeople);

app.use("/chats", chats);

app.use(chatRoom);

app.use("/", (req, res) => {
  return res.status(200).json({ message: "welcome to backend" });
});

//central error handling
app.use((err, req, res, next) => {
  console.log("error", err);
  const status = err.status || 500;
  const message =
    err.message ||
    "Something went wrong on the server. Please try again later!";
  return res.status(status).json({ message: message });
});

mongoose
  .connect(process.env.DB_CONNECTION_URL)
  //.connect("mongodb://localhost:27017")
  .then(() => {
    server.listen(process.env.PORT || 8080);
    console.log("connected to database");
  })
  .catch((e) => console.log("database conection failed", e));

module.exports = server;
