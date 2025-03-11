import express from "express";
import { EditProfile, FollowAndUnfollow, GetProfile, getSuggestedUsers, IsEmailFound, Login, ManualRegister,SendVarificationCodeToUserEmail, signout } from "../controllers/UserController.js";
import isAuthenticated from "../middlewares/IsAuther.js";
import { upload } from "../CloudConfig/Cloudinary.js";
const router = express.Router();
// for manual authentication
router.post('/verify-email',SendVarificationCodeToUserEmail);

router.post('/signup',ManualRegister);

router.post('/signin',Login);

router.post('/is-email-found',IsEmailFound);

router.post('/signout',isAuthenticated,signout);

router.get("/:id/profile",isAuthenticated,GetProfile);

router.put("/edit/profile",isAuthenticated,upload.single("profilePicture"),EditProfile);

router.get("/suggested",isAuthenticated,getSuggestedUsers);

router.post("/followOrUnfollow/:id",isAuthenticated,FollowAndUnfollow);

//for third party authentication
// router.post('/auth/google',googleAuth);
// router.post('/auth/facebook',facebookAuth);
// router.post('/auth/github',githubAuth);
// router.post('/auth/linkedin',linkedinAuth);
// router.post('/auth/instagram',instagramAuth);
export default router;