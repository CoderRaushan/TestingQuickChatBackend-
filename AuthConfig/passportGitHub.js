import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../models/UserModel.js";
import passport from "passport";
import dotenv from "dotenv";
dotenv.config();
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GithubClientID,
      clientSecret: process.env.GithubClientSecret,
      callbackURL: process.env.GithubCallbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Try to find an existing user by the email (which is more reliable than using the provider ID)
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // If the user exists, check if the provider already exists in the user's providers array
          const providerExists = user.providers.some(
            (provider) => provider.providerId === profile.id
          );
          if (providerExists) {
            return done(null, user); // If the provider is already linked, return the user
          }
          // Add the new provider (google) to the existing user's providers array
          user.providers.push({
            providerName: "github",
            providerId: profile.id,
          });
          await user.save();
          return done(null, user);
        }

        // If the user doesn't exist by email either, create a new user
        const newUser = new User({
          username: profile.username,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          providers: [
            {
              providerName: "github", // The name of the provider
              providerId: profile.id, // The unique ID from Google
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
