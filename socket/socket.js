import { Server } from "socket.io";
import express from "express";
import http from "http";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    },
    methods: ["GET", "POST"],
});

const UserSocketMap = {};//isme each user ke crossponding user ka socket id aayega
export const getReceiverSocketId=(receiverId)=>{
return UserSocketMap[receiverId];
}
io.on("connection",(socket)=>
{
    const userId=socket.handshake.query.userId;
    if(userId)
    {
        UserSocketMap[userId]=socket.id;
        console.log("user connected successfully!",userId,socket.id);
    }
    io.emit("OnlineUsers",Object.keys(UserSocketMap));
    socket.on("disconnect",()=>{
        console.log("user disconnected!",userId);
        delete UserSocketMap[userId];
        io.emit("OnlineUsers",Object.keys(UserSocketMap));
    });
});

export {io,app,server};