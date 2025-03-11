import express from 'express';
import isAuthenticated from '../middlewares/IsAuther.js';
import {upload} from '../CloudConfig/Cloudinary.js';
import 
{
    AddComment,AddNewPost,BookmarkPost,
    DisLikePost,GetAllPosts,GetUserPost,
    LikePost,GetCommentsOfPost, DeletePost
} 
from '../controllers/PostController.js';

const router = express.Router();
router.route('/add').post(isAuthenticated,upload.single('image'), AddNewPost);
router.route('/all').get(isAuthenticated, GetAllPosts);
router.route('/userpost/all').get(isAuthenticated, GetUserPost);    
router.route('/:id/like').get(isAuthenticated, LikePost);
router.route('/:id/dislike').get(isAuthenticated, DisLikePost);
router.route('/:id/comment').post(isAuthenticated, AddComment);
router.route('/:id/comment/all').get(isAuthenticated, GetCommentsOfPost);
router.route('/delete/:id').delete(isAuthenticated, DeletePost);
router.route('/:id/bookmark').post(isAuthenticated, BookmarkPost);

export default router;