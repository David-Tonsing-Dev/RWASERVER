const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origins: "*", methods: ["POST", "GET", "DELETE", "PUT"] },
});

io.on("connection", (socket) => {
  console.log("User connected to websocket: ", socket.id);

  socket.on("joinCategory", (categoryId) => {
    socket.join(categoryId);
    console.log("User joined category: ", categoryId);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

module.exports = { app, io, server };
