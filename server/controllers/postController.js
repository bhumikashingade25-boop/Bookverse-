const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Get All Posts (Social Feed)
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name avatar location streakDays')
      .populate('book', 'title author coverUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Post
exports.createPost = async (req, res) => {
  try {
    const { type, content, bookId, bookTitle, bookAuthor, bookCover, rating } = req.body;

    const post = await Post.create({
      author: req.user._id,
      type: type || 'Finished Reading',
      content,
      book: bookId || null,
      bookTitle: bookTitle || '',
      bookAuthor: bookAuthor || '',
      bookCover: bookCover || '',
      rating: rating || 5
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name avatar location streakDays')
      .populate('book', 'title author coverUrl');

    res.status(201).json({ success: true, post: populatedPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like / Unlike Post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userIdStr = req.user._id.toString();
    const index = post.likes.indexOf(userIdStr);

    if (index === -1) {
      post.likes.push(userIdStr);
      post.likesCount += 1;

      if (post.author.toString() !== userIdStr) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'LIKE',
          title: 'Post Liked!',
          message: `${req.user.name} liked your reading update.`,
          link: `/home`
        });
      }
    } else {
      post.likes.splice(index, 1);
      post.likesCount = Math.max(0, post.likesCount - 1);
    }

    await post.save();
    res.json({ success: true, likesCount: post.likesCount, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add Comment to Post
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await Comment.create({
      post: postId,
      user: req.user._id,
      content
    });

    post.commentsCount += 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id).populate('user', 'name avatar');

    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'COMMENT',
        title: 'New Comment!',
        message: `${req.user.name} commented: "${content.substring(0, 30)}..."`,
        link: `/home`
      });
    }

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
