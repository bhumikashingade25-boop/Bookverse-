import React, { useState } from 'react';
import { Heart, MessageSquare, Bookmark, Share2, Star, Flame, Repeat } from 'lucide-react';
import { likePostApi, addCommentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PostCard = ({ post, onWishlist }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.likes?.includes(user?._id));
  const [comments, setComments] = useState(post.comments || []);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleLike = async () => {
    try {
      const res = await likePostApi(post._id);
      if (res.data.success) {
        setLikesCount(res.data.likesCount);
        setIsLiked(res.data.isLiked);
      }
    } catch (err) {
      showToast(err.message || 'Could not update like', 'error');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      const res = await addCommentApi(post._id, { content: commentInput });
      if (res.data.success) {
        setComments(prev => [...prev, res.data.comment]);
        setCommentsCount(c => c + 1);
        setCommentInput('');
        showToast('Comment posted!');
      }
    } catch (err) {
      showToast('Error posting comment', 'error');
    }
  };

  return (
    <div className="bg-[#15171E] border border-white/10 hover:border-white/20 rounded-2xl p-5 space-y-4 shadow-xl transition">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full object-cover border border-gold-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-white">{post.author?.name}</h4>
              {post.author?.streakDays && (
                <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  <Flame className="w-3 h-3 mr-0.5 fill-amber-400" />
                  {post.author.streakDays}d Streak
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/10 text-gold-400 border border-gold-500/30 uppercase tracking-wider">
          {post.type}
        </span>
      </div>

      {/* Content Text */}
      <p className="text-sm text-gray-200 leading-relaxed">{post.content}</p>

      {/* Book Attachment Preview Card */}
      {(post.book || post.bookTitle) && (
        <div className="flex items-center gap-4 bg-[#1F2430]/60 border border-white/10 rounded-xl p-3">
          {post.bookCover || post.book?.coverUrl ? (
            <img
              src={post.bookCover || post.book?.coverUrl}
              alt={post.bookTitle}
              className="w-14 h-20 object-cover rounded-lg shadow-md shrink-0"
            />
          ) : (
            <div className="w-14 h-20 bg-black/40 rounded-lg flex items-center justify-center text-gold-400 font-bold">📖</div>
          )}

          <div className="flex-1 min-w-0">
            <h5 className="font-serif font-bold text-sm text-white truncate">{post.bookTitle || post.book?.title}</h5>
            <p className="text-xs text-gray-400">by {post.bookAuthor || post.book?.author}</p>
            {post.rating && (
              <div className="flex items-center gap-1 text-gold-400 text-xs font-bold mt-1">
                <Star className="w-3.5 h-3.5 fill-gold-400" />
                <span>{post.rating} / 5</span>
              </div>
            )}
          </div>

          {post.book && onWishlist && (
            <button
              onClick={() => onWishlist(post.book._id || post.book)}
              className="p-2 rounded-xl bg-gold-500/10 hover:bg-gold-500 text-gold-400 hover:text-black border border-gold-500/30 transition shrink-0"
              title="Add to Wishlist"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Post Actions Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-gray-400">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
            isLiked ? 'text-rose-400 bg-rose-500/10' : 'hover:text-white hover:bg-white/5'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-400' : ''}`} />
          <span>{likesCount} Likes</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/5 transition"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{commentsCount} Comments</span>
        </button>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            showToast('Post link copied to clipboard!');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:text-white hover:bg-white/5 transition"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <div className="pt-3 space-y-3 border-t border-white/10 animate-in fade-in">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2.5 text-xs bg-[#1F2430]/40 p-2.5 rounded-xl">
              <img src={c.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'} alt="" className="w-6 h-6 rounded-full object-cover" />
              <div>
                <span className="font-bold text-white mr-2">{c.user?.name || 'Reader'}</span>
                <span className="text-gray-300">{c.content}</span>
              </div>
            </div>
          ))}

          <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 bg-[#1F2430] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-gold-500/50"
            />
            <button type="submit" className="bg-gold-500 text-black px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-gold-400">
              Post
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
