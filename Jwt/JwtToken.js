import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const jwtTokenFunction=(userId,username,email,profilePicture,res)=>
{
   const jwtToken=jwt.sign({userId,username,email},process.env.JwtTokenKEY,{expiresIn:"2d"});
   res.cookie('quickchatjwttoken', jwtToken, 
   {
      maxAge: 24 * 60 * 60 * 1000, 
      httpOnly: true,              
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", 
      path:"/", 
      priority: 'High',         
    });
};
export default jwtTokenFunction;