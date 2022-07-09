const customError = require("./util/customError");

let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer);
    return io;
  },
  getIO: () => {
    if (!io) throw new customError("Socket.io is not initialized.", 500);
    return io;
  },
};
