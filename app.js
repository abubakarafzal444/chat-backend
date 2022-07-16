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

io.on("connection", (socket) => {
  console.log("client connected", socket.userId);
  connectedUsers[socket.userId] = socket;
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.userId);
    delete connectedUsers.userId;
    console.log("active users", Object.keys(connectedUsers).length);
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
      console.log("new message in room");
      try {
        const messageObj = new Message({
          from: socket.userId,
          to: data.roomId,
          message: data.message,
        });
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
        socket.to(data.roomId).emit(`chatRoomMessage`, {
          action: "NEW_MESSAGE",
          message: populatedMessage,
        });
        socket.emit(`chatRoomMessage`, {
          action: "NEW_MESSAGE",
          message: populatedMessage,
        });
      } catch (e) {
        console.log(e);
      }
    }
  });

  socket.on("sendingPersonalMsg", async (data) => {
    try {
      if (data.message.trim().length > 0) {
        console.log("new message in chat");
        const messageObj = new Message({
          from: socket.userId,
          to: data.to,
          message: data.message,
        });
        const savedMessage = await messageObj.save();

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
          console.log(deletedMessage);
        }

        // io.getIO().emit(`userMessage/${req._id}`, {
        //   action: "NEW_MESSAGE",
        //   message: savedMessage,
        // });
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
        console.log("hmmm", connectedUsers[data.to]);
        if (connectedUsers[data.to]) {
          socket
            .to(connectedUsers[data.to].id)
            .emit(`newPersonalMessage/${socket.userId}`, {
              action: "NEW_MESSAGE",
              message: populatedMessage,
            });
        }
        socket.emit(`newPersonalMessage`, {
          action: "NEW_MESSAGE",
          message: populatedMessage,
        });
      }
    } catch (e) {
      console.log(e);
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
  // .connect("mongodb://localhost:27017")
  .then(() => {
    server.listen(process.env.PORT || 8080);
    // const io = require("./socket").init(server);
    // io.on("connection", (socket) => {
    //   console.log("Client connected");

    //   socket.on(`joinedRoom`, (data) => {
    //     console.log("joined log");
    //     console.log(data);
    //     if (data.action === "JOINED-ROOM") {
    //       socket.broadcast.emit(`roomJoined/${data.roomId}`, {
    //         action: "PERSON_JOINED",
    //         userName: data.userName,
    //       });
    //     }
    //   });
    // });

    console.log("connected to database");
  })
  .catch((e) => console.log("database conection failed", e));

module.exports = server;
