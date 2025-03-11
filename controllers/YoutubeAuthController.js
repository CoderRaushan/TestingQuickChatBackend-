import jwt from 'jsonwebtoken';
import jwtTokenFunction from '../Jwt/JwtToken.js';

export const sendTokenResponse = (user, res) => {
  if (user)
    {
      console.log(user);
      jwtTokenFunction(user._id, user.username, user.email,user.profilePicture, res);
    }
  res.status(200).json({ message: "User login successfully!", success: true, user });
};


