import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import Comment from "../models/CommentModel.js";
import { getReceiverSocketId, io} from "../socket/socket.js";
//add new post
export const AddNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const author = req.id;
    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
        success: false,
      });
    }
    
    const PostPicture = req.file.path;
    if (!caption || !PostPicture || !author) {
      return res.status(400).json({
        message: "Please fill in all fields",
        success: false, 
      });
    }

    // Create the post
    const post = await Post.create({
      caption,
      image: PostPicture,
      author,
    });

    // Populate author field (excluding password)
    await post.populate({ path: "author", select: "-password" });

    // Find the user by ID
    const user = await User.findById(author);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Push post ID to user's posts array
    user.posts.push(post._id);
    await user.save();

    res.status(201).json({
      message: "Post created successfully",
      success: true,
      post,
    });

  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
};
//getall posts
export const GetAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({ path: 'author', select: 'username profilePicture bio' })
      .populate({ path: 'comments', populate: { path: 'author', select: 'username profilePicture' } })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message:"Posts Fetched!",
      success: true,
      posts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false
    });
  }
};
//getuserposts
export const GetUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .populate({ path: 'author', select: 'username profilePicture' })
      .populate({ path: 'comments',model: "Comment", populate: { path: 'author', select: 'username profilePicture' } })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message:"All User Posts Fetched!",
      success: true,
      posts
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error!",
      success: false
    });
  }
};
//like post
export const LikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }
    // Like logic
    await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
    await post.save();
    // Implement socket.io for real-time notification (if needed)
    const user=await User.findById(likeKrneWalaUserKiId).select("username profilePicture");
    const OwnerId=post.author.toString();
    const ReceiverSocketId=getReceiverSocketId(OwnerId);
    if(OwnerId !== likeKrneWalaUserKiId)
    {
      const Notification={
        type:"like",
        userId:likeKrneWalaUserKiId,
        userDetails:user,
        postId,
        message:"your post was liked!"
      }
      io.to(ReceiverSocketId).emit("notification",Notification);
    }
    
    return res.status(200).json({
      message: 'Post liked!',
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//dislike
export const DisLikePost = async (req, res) => {
  try {
    const likeKrneWalaUserKiId = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }
    // Like logic
    await post.updateOne({ $pull:{ likes: likeKrneWalaUserKiId } });
    await post.save();
    // Implement socket.io for real-time notification (if needed)

    const user=await User.findById(likeKrneWalaUserKiId).select("_id username profilePicture");
    const OwnerId=post.author.toString();
    const ReceiverSocketId=getReceiverSocketId(OwnerId);
    if(OwnerId !== likeKrneWalaUserKiId)
    {
      const Notification={
        type:"dislike",
        userId:likeKrneWalaUserKiId,
        userDetails:user, 
        postId,
        message:"your post was dislike!"
      }
      io.to(ReceiverSocketId).emit("notification",Notification);
    }
   
    return res.status(200).json({
      message: 'Post disliked!',
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//add comments
export const AddComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;
    if (!text) 
    {  
      return res.status(400).json({
        message: 'Text is required',
        success: false
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }

    const comment = await Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      post: postId
    });

    await comment.populate({ path: 'author', select: 'username profilePicture' });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: 'Comment added!',
      success: true,
      comment 
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//comments of each post
export const GetCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId })
    .populate({path:'author', select: "username profilePicture"});

    if (!comments || comments.length === 0) {
      return res.status(404).json({
        message: 'No comments found for this post',
        success: false
      });
    }

    return res.status(200).json({
      message:"Comment Added!",
      success: true,
      comments
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//delete post
export const DeletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }
    if (post.author.toString() !== authorId) {
      return res.status(403).json({
        message: 'You can not delete this post you are not author of this post!',
        success: false
      });
    }
    await Post.findByIdAndDelete(postId);

    // Remove the post id from the user's posts
    const user = await User.findById(authorId);
    user.posts = user.posts.filter(id => id.toString() !== postId);
    await user.save();

    // Delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: 'Post deleted',
      
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};
//post add to bookmark or unsave the post
export const BookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);  
    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        success: false
      });
    }
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      // Already bookmarked - remove from the bookmark
      await user.updateOne({$pull:{bookmarks:post._id}});
      await user.save();
      return res.status(200).json({
        message: 'Post removed from bookmark',
        success: true
      });
    }
    // Bookmark the post
    await user.updateOne({$addToSet:{bookmarks:post._id}});
    await user.save();
    return res.status(200).json({
      message: 'Post bookmarked',
      success: true
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Internal server error!',
      success: false
    });
  }
};