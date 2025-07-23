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

  socket.on("joinCategory", ({ categoryId }) => {
    socket.join(categoryId);
    console.log("User joined category: ", categoryId);
  });

  socket.on("leaveCategory", ({ categoryId }) => {
    socket.leave(categoryId);
    console.log("User leave category: ", categoryId);
  });

  socket.on("joinSubCategory", ({ subCategoryId }) => {
    socket.join(subCategoryId);
    console.log("User joined SubCategory: ", subCategoryId);
  });

  socket.on("leaveSubCategory", ({ subCategoryId }) => {
    socket.leave(subCategoryId);
    console.log("User leave subCategory: ", subCategoryId);
  });

  socket.on("joinForum", ({ forumId }) => {
    console.log("user joining....");
    socket.join(forumId);
    console.log("User joined forum", forumId);
  });

  socket.on("leaveForum", ({ forumId }) => {
    socket.leave(forumId);
    console.log("User leave forum: ", forumId);
  });

  socket.on("checkRooms", () => {
    console.log(`Socket ${socket.id} is in rooms:`, Array.from(socket.rooms));
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

module.exports = { app, io, server };
