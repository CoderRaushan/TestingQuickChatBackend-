import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FacebookClientID,
      clientSecret: process.env.FacebookClientSecret,
      callbackURL: process.env.FacebookCallbackURL,
      profileFields: ["id", "emails", "name", "photos"], // Ensure email is included
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          const providerExists = user.providers.some(
            (provider) => provider.providerId === profile.id
          );
          if (providerExists) return done(null, user);
          user.providers.push({
            providerName: "facebook",
            providerId: profile.id,
          });
          await user.save();
          return done(null, user);
        }

        const newUser = new User({
          username: `${profile.name.givenName} ${profile.name.familyName}`,
          email: profile.emails[0].value,
          profilePicture: profile.photos[0].value,
          providers: [
            {
              providerName: "facebook",
              providerId: profile.id,
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
