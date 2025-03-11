import { WelComeMessage } from "../middlewares/WelComeEmail.js";
import User from "../models/UserModel.js";
import VerificationCode from "../models/VerificationCodeModel.js"
import { SendVarificationCode } from "../middlewares/VarifyEmail.js";
import jwtTokenFunction from "../Jwt/JwtToken.js";
import Post from "../models/PostModel.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const SendVarificationCodeToUserEmail = async (req, res) => {
  try {
    const { username, email } = req.body;
    if (!username || !email) {
      return res.status(401).json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    // Generate verification code
    const VarCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Save verification code to the database
    const NewVerificationCode = new VerificationCode({
      email: email,
      VerfiCode: VarCode,
    });
    await NewVerificationCode.save();
    await SendVarificationCode(email, VarCode);
    res.status(201).json({
      message: "Verification Code has been sent to your email. Please check your inbox!",
      success: true,
      VarCode
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: err.message || err,
    });
  }
};

export const ManualRegister = async (req, res) => {
  try {
    const { username, email, Varcode, age, password, name } = req.body;
    // Check for missing fields
    if (!username || !email || !password || !Varcode || !age || !name) {
      return res.status(401).json({
        message: "Please fill all the fields",
        success: false,
      });
    }
    //  console.log(VarificationCode);
    // Fetch verification code for the email
    const VarCodeEntry = await VerificationCode.findOne({ email });

    // Check if verification code exists
    if (!VarCodeEntry) {
      return res.status(404).json({
        message: "Verification code not found or expired!",
        success: false,
      });
    }

    // Verify the provided code
    if (VarCodeEntry.VerfiCode != Varcode) {
      return res.status(400).json({
        message: "Invalid verification code!",
        success: false,
      });
    }

    // Check if user already exists
    const UserExist = await User.findOne({ email });
    if (UserExist) {
      if (UserExist.IsVerified) {
        return res.status(400).json({
          message: "User already registered and verified!",
          success: false,
        });
      }
      return res.status(400).json({
        message: "User already exists but is not verified!",
        success: false,
      });
    }

    // Register the user
    const newUser = new User({
      username,
      name,
      email,
      password,
      age,
      IsVerified: true,
    });

    const savedUser = await newUser.save();

    // Send a welcome email
    await WelComeMessage(email, username);

    // Remove the verification code entry after successful registration
    await VerificationCode.deleteOne({ email });

    res.status(201).json({
      message: "User registered successfully!",
      success: true,
      user: savedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error!",
      success: false,
      error: err.message || err,
    });
  }
};

export const IsEmailFound = async (req, res) => {
  const email = req.body.email;
  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required!" });
    }
    const user = await User.findOne({ email }).select("IsVerified");
    if (user) {
      return res.status(200).json({ message: "User found!", success: true, user });
    }
    return res.status(404).json({ message: "User not found!", success: false });
  } catch (error) {
    console.error("IsEmailFound error:", error);
    return res.status(500).json({ error: "Internal server error!", success: false });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required!", success: false });
    }
    const user = await User.findOne({ email })
      .populate({
        path: "following",
        select: "_id name username profilePicture"
      })
      .populate({
        path: "followers",
        select: "_id name username profilePicture"
      });
    //!(await bcrypt.compare(password, user.password)
    if (!user) {
      return res.status(400).json({ error: "Invalid user credential!", success: false });
    }
    // Check if user is password is correct or not
    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid user credential!", success: false });
    }
    if (user) {
      jwtTokenFunction(user._id, user.username, user.email, user.profilePicture, res);
    }
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post && post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    const logedinUser = {
      _id: user._id,
      username: user.username,
      name: user.name,
      age: user.age,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      bookmarks: user.bookmarks,
      posts: populatedPosts,
    }
    return res.status(200).json({
      message: "User logged in successfully!",
      success: true,
      user: logedinUser
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error!" });
  }
};

export const signout = async (req, res) => {
  try {
    res.cookie('quickchatjwttoken', '',
      {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: 'None',
        path: '/',
      });
    return res.status(201).json({ message: "User Loged Out successfully!", success: true });
  }
  catch (error) {
    console.log("error", error);
    return res.status(500).json({ error: "Internal server error!", success: false });
  }
};

export const GetProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate({
        path: "posts", options: { sort: { createdAt: -1 } }, populate: [
          { path: "author", select: "username profilePicture" },
          {
            path: "comments",
            populate: { path: "author", select: "username profilePicture" }
          }
        ]
      })
      .populate({ path: "bookmarks", options: { sort: { createdAt: -1 } } })
      .select("-password")
      .populate({
        path: "following",
        // select: "_id name username profilePicture"
      })
      .populate({
        path: "followers",
        // select: "_id name username profilePicture"
      });
    if (!user) {
      return res.status(404).json({ message: "User not found!", success: false });
    }

    return res.status(200).json({ user, success: true });

  } catch (error) {
    console.error("Error in GetProfile:", error.message);
    return res.status(500).json({ error: "Internal server error!", success: false });
  }
};
export const EditProfile = async (req, res) => {
  try {
    const { bio, gender } = req.body;
    let profilePic;
    if (req.file) {
      profilePic = req.file.path;
    }
    if (!bio && !gender && !profilePic) {
      return res.status(400).json({
        message: "No fields to update provided",
        success: false,
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.id,
      {
        // ...(age && { age }),
        ...(bio && { bio }),
        ...(gender && { gender }),
        ...(profilePic && { profilePicture: profilePic }),
      },
      { new: true }
    ).select("-password");
    if (!updatedUser) {
      return res.status(404).json(
        {
          message: "User not found!",
          success: false,
          userid: req.id
        });
    }
    return res.status(200).json({
      message: "Profile updated!",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password"); // Adjust the query as needed
    if (!suggestedUsers || suggestedUsers.length === 0) {
      return res.status(400).json({
        message: 'Currently do not have any suggested users!',
        success: false
      });
    }
    return res.status(200).json({
      message: "All Suggested Users Fetched!",
      success: true,
      users: suggestedUsers
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error',
      success: false
    });
  }
};
// follow Or unfollow logic
export const FollowAndUnfollow = async (req, res) => {
  try {
    const IdOfUserWhichFollowsTargetUser = req.id;
    const IdOfTheTargetUser = req.params.id;

    if (!IdOfUserWhichFollowsTargetUser || !IdOfTheTargetUser) {
      return res.status(400).json({
        message: "User ID not found!",
        success: false
      });
    }

    if (IdOfUserWhichFollowsTargetUser === IdOfTheTargetUser) {
      return res.status(400).json({
        message: "You cannot follow or unfollow yourself!",
        success: false
      });
    }

    // Find both users
    const [UserWhichFollowsTargetUser, TargetUser] = await Promise.all([
      User.findById(IdOfUserWhichFollowsTargetUser),
      User.findById(IdOfTheTargetUser),
    ]);

    if (!UserWhichFollowsTargetUser || !TargetUser) {
      return res.status(404).json({
        message: "User not found!",
        success: false,
      });
    }

    // Check if the user is already followed
    const IsFollowed = UserWhichFollowsTargetUser.following.includes(IdOfTheTargetUser);

    if (IsFollowed) {
      // **Unfollow logic**
      await Promise.all([
        User.updateOne({ _id: IdOfUserWhichFollowsTargetUser }, { $pull: { following: IdOfTheTargetUser } }),
        User.updateOne({ _id: IdOfTheTargetUser }, { $pull: { followers: IdOfUserWhichFollowsTargetUser } }),
      ]);

      // Send socket notification
      const user = await User.findById(IdOfUserWhichFollowsTargetUser);
      const authorUser = await User.findById(IdOfTheTargetUser)
        .populate([
          { path: "following", select: "_id name username profilePicture" },
          { path: "followers", select: "_id name username profilePicture" }
        ]);
      const OwnerId = IdOfTheTargetUser.toString();
      const ReceiverSocketId = getReceiverSocketId(OwnerId);

      if (OwnerId !== IdOfUserWhichFollowsTargetUser) {
        const Notification = {
          type: "unfollow",
          userId: IdOfUserWhichFollowsTargetUser,
          userDetails: user,
          author: authorUser,
          message: "You are unfollowed!"
        };
        io.to(ReceiverSocketId).emit("unfollow", Notification);
      }

      return res.status(200).json({
        message: "Unfollowed Successfully!",
        success: true
      });
    } else {
      // **Follow logic**
      await Promise.all([
        User.updateOne({ _id: IdOfUserWhichFollowsTargetUser }, { $push: { following: IdOfTheTargetUser } }),
        User.updateOne({ _id: IdOfTheTargetUser }, { $push: { followers: IdOfUserWhichFollowsTargetUser } })
      ]);

      // Send socket notification
      const user = await User.findById(IdOfUserWhichFollowsTargetUser);
      const authorUser = await User.findById(IdOfTheTargetUser)
        .populate([
          { path: "following", select: "_id name username profilePicture" },
          { path: "followers", select: "_id name username profilePicture" }
        ]);
      const OwnerId = IdOfTheTargetUser.toString();
      const ReceiverSocketId = getReceiverSocketId(OwnerId);

      if (OwnerId !== IdOfUserWhichFollowsTargetUser) {
        const Notification = {
          type: "follow", // ✅ Correct event name
          userId: IdOfUserWhichFollowsTargetUser,
          userDetails: user,
          author: authorUser,
          message: "You are followed!"
        };
        io.to(ReceiverSocketId).emit("follow", Notification);
      }

      return res.status(200).json({
        message: "Followed Successfully!",
        success: true
      });
    }
  } catch (error) {
    console.error("Error in FollowAndUnfollowLogic:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false
    });
  }
};
