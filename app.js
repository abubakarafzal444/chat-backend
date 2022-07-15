require("dotenv").config();
const express = require("express");

const bodyParser = require("body-parser");
const userRoutes = require("./routes/User");
const SearchPeople = require("./routes/SearchPeople");
const chats = require("./routes/Messages");
const chatRoom = require("./routes/ChatRoom");

const mongoose = require("mongoose");
const multerMiddleware = require("./middlewares/multer-config");

const app = express();
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, { origin: "*" });
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
  // .connect(process.env.DB_CONNECTION_URL)
  .connect("mongodb://localhost:27017")
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");

      socket.on(`joinedRoom`, (data) => {
        console.log("joined log");
        console.log(data);
        if (data.action === "JOINED-ROOM") {
          socket.broadcast.emit(`roomJoined/${data.roomId}`, {
            action: "PERSON_JOINED",
            userName: data.userName,
          });
        }
      });
    });

    io.on("disconnect", (socket) => {
      console.log("Client disconnected");
    });

    console.log("connected to database");
  })
  .catch((e) => console.log("database conection failed", e));
