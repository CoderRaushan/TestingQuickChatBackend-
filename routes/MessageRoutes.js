import express from 'express';
import isAuthenticated from '../middlewares/IsAuther.js';
import { SendMessage, GetMessage } from '../controllers/MessageController.js';
const router = express.Router();

router.post('/send/:id', isAuthenticated, SendMessage);
router.get('/all/:id', isAuthenticated, GetMessage);

export default router;