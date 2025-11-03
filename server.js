require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 8000;

const { server, app } = require("./socket/socket");

const userRouter = require("./routes/userRouters");
const userTokenRouter = require("./routes/userTokenRouters");
const rwaRouter = require("./routes/rwaTokenRouters");
const rwaMobileRouter = require("./routes/rwaMobileRouters");
const lectureRouter = require("./routes/lectureRouters");
const treasuryTokens = require("./routes/condoTreasuryTokenRouters");
const forumCategoryRouter = require("./routes/forumCategoryRouters");
const forumRouter = require("./routes/forumRouters");
const forumCommentRouter = require("./routes/forumCommentRouters");
const followRouter = require("./routes/followRouters");

const adminUserRouter = require("./admin/routes/userRouters");
const adminNewsRouter = require("./admin/routes/newsRouters");
const adminBlogRouter = require("./admin/routes/blogRouters");
const adminReviewRouter = require("./admin/routes/reviewRouters");
const adminTokenRouter = require("./admin/routes/tokenRouters");
const adminAirdropRouter = require("./admin/routes/airdropRouters");
const podcastDetailsRouters = require("./admin/routes/podcastDetailsRouters");
const userTokenRouters = require("./admin/routes/userTokenRouters");
const analystRouters = require("./admin/routes/analystRouters");
const googleAnalyticsDataRouters = require("./admin/routes/googleAnalyticsDataRouters");
const profile = require("./admin/routes/userProfileRouters");
const termRouter = require("./admin/routes/termRouters");
const categoryRouter = require("./admin/routes/categoryRouters");
const forumAdminCategoryRouter = require("./admin/routes/forumCategoryRouters");
const forumAdminSubCategoryRouter = require("./admin/routes/forumSubCategoryRouters");
const treasuryChartRouter = require("./routes/treasuryChartRouters");
const userAirdropRouter = require("./routes/userAirdropRouters");
const podcastRouter = require("./routes/podcastRouters");
const eventRouter = require("./admin/routes/eventRouters");
const eventDataRouter = require("./routes/eventRouters");

const schedular = require("./cron/schedular");
const analysticsData = require("./cron/analystics");
const hightLight = require("./cron/highLight");
const mobileAppGA4Data = require("./admin/routes/googleAnalyticsDataRouters");
const cookieParser = require("cookie-parser");
const views = require("./cron/views");
const allowedOrigins = [
  "https://rwa.guide",
  "http://localhost:3000",
  "https://demoguide.netlify.app",
  "https://newuirwaguide.netlify.app",
  "https://test-guide.netlify.app",
  "http://192.168.31.16:3000",
  "https://powdex.io",
  "https://rwahedgefund.netlify.app",
  "https://condobase.io",
  "https://rwapros.com",
  "https://rwaprosnew.netlify.app",
  "https://ethwclub.netlify.app",
  "https://ethw.club",
  "http://ethw.club",
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
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/api/users", userRouter);
app.use("/api/user/token", userTokenRouter);
app.use("/api/currencies", rwaRouter);
app.use("/api/mobile/currencies", rwaMobileRouter);
app.use("/api/lecture", lectureRouter);
app.use("/api/treasuryTokens", treasuryTokens);
app.use("/api/forum-category", forumCategoryRouter);
app.use("/api/forum", forumRouter);
app.use("/api/forum/comment", forumCommentRouter);
app.use("/api/portfolio", treasuryChartRouter);
app.use("/api/mobileapp/googleAnalytics", mobileAppGA4Data);
app.use("/api/airdrops", userAirdropRouter);
app.use("/api/podcasts", podcastRouter);
app.use("/api/events", eventDataRouter);
app.use("/api/follow", followRouter);

app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/news", adminNewsRouter);
app.use("/api/admin/blog", adminBlogRouter);
app.use("/api/admin/review", adminReviewRouter);
app.use("/api/admin/token", adminTokenRouter);
app.use("/api/admin/airdrop", adminAirdropRouter);
app.use("/api/admin/podcast", podcastDetailsRouters);
app.use("/api/admin/userToken", userTokenRouters);
app.use("/api/admin/analyst", analystRouters);
app.use("/api/admin/analystic", googleAnalyticsDataRouters);
app.use("/api/admin/profile", profile);
app.use("/api/admin/term", termRouter);
app.use("/api/admin/category", categoryRouter);
app.use("/api/admin/forum-category", forumAdminCategoryRouter);
app.use("/api/admin/forum-sub-category", forumAdminSubCategoryRouter);
app.use("/api/admin/events", eventRouter);

mongoose.connect(process.env.MONGODB_URI).then(() => {
  server.listen(PORT, async () => {
    console.log(`Listening on port ${PORT}`);
    console.log("Database connection established");
    schedular();
    analysticsData();
    hightLight();
    views();
  });
});
