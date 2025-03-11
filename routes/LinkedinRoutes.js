import express from "express";
import passport from "passport";
import { sendTokenResponse, linkedinLoginFailure } from "../controllers/LinkedinController.js";
const router = express.Router();

router.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" })
);

router.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", { failureRedirect: "/auth/linkedin/failure" }),
  sendTokenResponse
);

router.get("/linkedin/failure", linkedinLoginFailure);

export default router;
