import passport from 'passport';
import { sendTokenResponse } from '../controllers/githubAuthController.js'; // Make sure this controller is specific to GitHub
import express from 'express';

const router = express.Router();

// GitHub Authentication Route
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

// GitHub Callback Route
router.get(
  '/auth/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    sendTokenResponse(req.user, res);
  }
);
export default router;
