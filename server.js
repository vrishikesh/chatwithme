const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log(`client is connected ${socket.id}`);

  socket.on("userMessage", (data) => {
    io.sockets.emit("userMessage", data);
  });

  socket.on("userTyping", (data) => {
    socket.broadcast.emit("userTyping", data);
  });
});
