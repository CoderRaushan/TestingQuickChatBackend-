import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import express from "express";
const app=express();
app.use(cookieParser());
const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.quickchatjwttoken;
    // console.log("Token is",token);
    if (!token) {
      return res.status(401).json({
        message: 
        "You are not authenticated.",
        success: false
      });
    }
    const decoded = jwt.verify(token, process.env.JwtTokenKEY);
    if (!decoded) {
      return res.status(401).json({
        message: 'Invalid token',
        success: false
      });
    }
    req.id = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};
export default isAuthenticated;