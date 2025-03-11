import passport from 'passport';
import { sendTokenResponse } from '../controllers/googleAuthController.js';
import express from 'express';

const router = express.Router();

// YouTube Authentication Route
router.get(
  '/auth/youtube',
  passport.authenticate('youtube', {
    scope: ['https://www.googleapis.com/auth/youtube.readonly', 'profile', 'email'],
  })
);

// YouTube Callback Route
router.get(
  '/auth/youtube/callback',
  passport.authenticate('youtube', { session: false }),
  (req, res) => {
    sendTokenResponse(req.user, res);
  }
);

export default router;
