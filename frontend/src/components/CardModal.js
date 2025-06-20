import React, { useState, useEffect } from "react";
import * as api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const CardModal = ({ card: initialCard, onClose }) => {
  const { theme } = useTheme();
  const [card, setCard] = useState(initialCard);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ message: "", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const commentsData = await api.fetchComments(card.id);
        setComments(commentsData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setError("Failed to load comments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [card.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.message.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      const comment = await api.createComment(card.id, newComment);
      setComments([comment, ...comments]);
      setNewComment({ message: "", author: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await api.deleteComment(commentId);
        setComments(comments.filter(comment => comment.id !== commentId));
        setError(null);
      } catch (err) {
        console.error("Failed to delete comment:", err);
        setError("Failed to delete comment. Please try again.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`${theme === 'light' ? 'bg-lightBox border-lightBorder' : 'bg-box border-dark'} rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden border transition-colors duration-300`}>
        <div className={`flex justify-between items-center ${theme === 'light' ? 'bg-lightDarkgrey border-lightBorder' : 'bg-darkgrey border-dark'} px-6 py-4 border-b transition-colors duration-300`}>
          <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>{card.title}</h2>
          <button
            onClick={onClose}
            className={`${theme === 'light' ? 'text-gray-600 hover:text-dark' : 'text-gray-400 hover:text-white'}`}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className={`p-6 border-b ${theme === 'light' ? 'border-lightBorder' : 'border-dark'}`}>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full rounded-md object-cover max-h-64"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif";
                  }}
                />
              </div>
              <div className="md:w-1/2">
                <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-dark' : 'text-white'} mb-2`}>{card.title}</h3>
                {card.message && (
                  <p className={`${theme === 'light' ? 'text-dark' : 'text-white'} mb-4`}>{card.message}</p>
                )}
                <div className={`flex items-center justify-between text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} mb-4`}>
                  <span>By {card.author || "Anonymous"}</span>
                  <span>{formatDate(card.createdAt)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <button
                    onClick={async () => {
                      try {
                        const updatedCard = await api.upvoteCard(card.id);
                        setCard(updatedCard);
                      } catch (err) {
                        console.error("Failed to upvote card:", err);
                      }
                    }}
                    className="flex items-center mr-3 hover:text-green-600"
                  >
                    <span className="mr-1">👍</span>
                    <span className="font-medium">{card.votes}</span>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const updatedCard = await api.likeCard(card.id);
                        setCard(updatedCard);
                      } catch (err) {
                        console.error("Failed to like card:", err);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 flex items-center"
                  >
                    <span>❤️</span>
                    <span className="ml-1 font-medium">{card.likes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-6 border-b ${theme === 'light' ? 'border-lightBorder' : 'border-dark'}`}>
            <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-dark' : 'text-white'} mb-4`}>Comments</h3>
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Add a comment*</label>
                <textarea
                  value={newComment.message}
                  onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}
                  placeholder="Write your comment here..."
                  className={`w-full px-3 py-2 border rounded-md ${theme === 'light' ? 'bg-white text-dark border-lightBorder' : 'bg-black text-white border-dark'}`}
                  rows="2"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Your Name (optional)</label>
                <input
                  type="text"
                  value={newComment.author}
                  onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
                  placeholder="Who's commenting?"
                  className={`w-full px-3 py-2 border rounded-md ${theme === 'light' ? 'bg-white text-dark border-lightBorder' : 'bg-black text-white border-dark'}`}
                />
              </div>
              <button
                type="submit"
                className="bg-hotpink text-white py-2 px-4 rounded-md hover:bg-hotpink-dark focus-visible btn-primary"
                disabled={submitting || !newComment.message.trim()}
              >
                {submitting ? "Adding..." : "Add Comment"}
              </button>
            </form>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-center mb-4">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-hotpink"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md text-center">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className={`${theme === 'light' ? 'bg-lightDarkgrey border-lightBorder' : 'bg-darkgrey border-dark'} rounded-md p-4 border transition-colors duration-300`}>
                    <p className={`${theme === 'light' ? 'text-dark' : 'text-white'} mb-2`}>{comment.message}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                        <span>By {comment.author || "Anonymous"}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete comment"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
