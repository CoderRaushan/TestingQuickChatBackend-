import passport from 'passport';
import { sendTokenResponse } from '../controllers/googleAuthController.js';
import express from 'express';
const router = express.Router();
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    sendTokenResponse(req.user, res);
  }
);
export default router;