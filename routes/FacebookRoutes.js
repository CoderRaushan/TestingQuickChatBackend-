import passport from "passport";
import { sendTokenResponse } from "../controllers/FacebookController.js";
import express from "express";

const router = express.Router();

router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { session: false }),
  (req, res) => {
    sendTokenResponse(req.user, res);
  }
);

export default router;
