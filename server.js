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

const adminUserRouter = require("./admin/routes/userRouters");
const adminNewsRouter = require("./admin/routes/newsRouters");
const adminBlogRouter = require("./admin/routes/blogRouters");
const adminReviewRouter = require("./admin/routes/reviewRouters");

const schedular = require("./cron/schedular");

const allowedOrigins = [
  "https://rwa.guide",
  "http://localhost:3000",
  "https://demoguide.netlify.app",
  "https://newuirwaguide.netlify.app",
  "https://test-guide.netlify.app",
  "http://192.168.31.16:3000",
  "https://powdex.io",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/api/users", userRouter);
app.use("/api/user/token", userTokenRouter);
app.use("/api/currencies", rwaRouter);
app.use("/api/mobile/currencies", rwaMobileRouter);
app.use("/api/lecture", lectureRouter);

app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/news", adminNewsRouter);
app.use("/api/admin/blog", adminBlogRouter);
app.use("/api/admin/review", adminReviewRouter);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  app.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    console.log("Database connection established");
    schedular();
  });
});
