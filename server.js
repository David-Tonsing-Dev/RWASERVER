require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;

const userRouter = require("./routes/userRouters");
const rwaRouter = require("./routes/rwaTokenRouters");
const rwaMobileRouter = require("./routes/rwaMobileRouters");

app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/currencies", rwaRouter);
app.use("/api/mobile/currencies", rwaMobileRouter);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, "192.168.1.7", async () => {
    console.log(`Listening on port ${PORT}`);
    console.log("Database connection established");
  });
});
