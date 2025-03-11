import { io } from '../socket/socket.js';
import Conversation from '../models/ConversationModel.js';
import Message from '../models/MessageModel.js';
import { getReceiverSocketId } from '../socket/socket.js';
//send message
export const SendMessage = async (req, res) => {
  try {   
    const senderId = req.id;
    const receiverId = req.params.id;
    const {text} = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }    
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate("message");

    // Establish the conversation if not started yet
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      messages:text
    });

    if (newMessage) {
      conversation.message.push(newMessage._id);
      await Promise.all([conversation.save(), newMessage.save()]);
    }

    // Implement socket.io for real-time data transfer (if needed)
    const ReceiverSocketId = getReceiverSocketId(receiverId);
    if (ReceiverSocketId) {
      io.to(ReceiverSocketId).emit("newMessage", newMessage);
    }
    return res.status(201).json({
      success: true,
      newMessage
    });  
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//get message b/w sender and receiver
export const GetMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate('message');

    if (!conversation) {
      return res.status(404).json({
        message: 'No conversation found',
        success: false
      });
    }

    return res.status(200).json({
      success: true,
      messages: conversation.message
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};