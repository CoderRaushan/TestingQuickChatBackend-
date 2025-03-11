import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();
// YouTube OAuth Strategy
passport.use(
  "youtube",
  new GoogleStrategy(
    {
      clientID: process.env.YoutubeClientID,
      clientSecret: process.env.YoutubeClientSecret,
      callbackURL: process.env.youtubeCallbackURL,
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly", // YouTube-specific scope
        "email",
        "name",
        "profile",
      ],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if a user with the email already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // If the user exists, check if the provider already exists in the user's providers array
          const providerExists = user.providers.some(
            (provider) => provider.providerId === profile.id
          );

          if (providerExists) {
            return done(null, user); // If the provider is already linked, return the user
          }

          // Add the new provider (YouTube) to the existing user's providers array
          user.providers.push({
            providerName: "youtube",
            providerId: profile.id,
          });

          await user.save();
          return done(null, user);
        }

        // If the user doesn't exist, create a new user
        const newUser = new User({
          username: profile.displayName,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          providers: [
            {
              providerName: "youtube", // Provider name
              providerId: profile.id, // Unique YouTube ID
            },
          ],
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
