const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value,
          confirmedEmail: true,
        }).save();
      }
      done(null, user);
    }
  )
);
