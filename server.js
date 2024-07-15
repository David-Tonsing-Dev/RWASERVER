require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;

const userRouter = require("./routes/userRouters");
const userTokenRouter = require("./routes/userTokenRouters");
const rwaRouter = require("./routes/rwaTokenRouters");
const rwaMobileRouter = require("./routes/rwaMobileRouters");
const lectureRouter = require("./routes/lectureRouters");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/api/users", userRouter);
app.use("/api/user/token", userTokenRouter);
app.use("/api/currencies", rwaRouter);
app.use("/api/mobile/currencies", rwaMobileRouter);
app.use("/api/lecture", lectureRouter);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    console.log("Database connection established");
  });
});
