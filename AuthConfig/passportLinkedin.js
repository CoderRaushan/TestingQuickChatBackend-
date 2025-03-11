import passport from "passport";
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from "../models/UserModel.js";
import dotenv from "dotenv";
dotenv.config();
passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LinkedinClientID,
      clientSecret: process.env.LinkedinClientSecret,
      callbackURL: process.env.LinkedinCallbackURL,
      scope: ["r_emailaddress", "r_liteprofile"],
      state: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });
        if (user) 
        {
          const providerExists = user.providers.some(
            (provider) => provider.providerId === profile.id
          );
          if (providerExists) return done(null, user);
          user.providers.push({
            providerName: "linkedin",
            providerId: profile.id,
          });
          await user.save();
          return done(null, user);
        }
        const newUser = new User({
          username: profile.displayName,
          email:profile.emails[0]?.value,
          profilePicture: profile.photos[0]?.value,
          providers: 
          [
            {
              providerName: "linkedin",
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
