const express = require('express');
const router = express.Router();
const { getPosts, createPost, likePost, addComment, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/:id', protect, deletePost);

module.exports = router;
