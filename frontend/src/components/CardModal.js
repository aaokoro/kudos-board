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
  const [usingDefaultComments, setUsingDefaultComments] = useState(false);

  // Generate default comments when API fails
  const generateDefaultComments = () => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: `default-comment-${i}`,
      message: `This is a default comment ${i + 1} created when the API is unavailable.`,
      author: i === 0 ? "System" : i === 1 ? "Demo User" : "Anonymous",
      createdAt: new Date(Date.now() - i * 3600000).toISOString(), // Staggered times
      cardId: card.id
    }));
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        // Don't try to fetch comments for default cards
        if (card.id.startsWith('default-card-')) {
          const defaultComments = generateDefaultComments();
          setComments(defaultComments);
          setError("Using default comments as this is a demo card.");
          setUsingDefaultComments(true);
        } else {
          const commentsData = await api.fetchComments(card.id);
          setComments(commentsData);
          setError(null);
          setUsingDefaultComments(false);
        }
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        // Use default comments when API fails
        const defaultComments = generateDefaultComments();
        setComments(defaultComments);
        setError("Using default comments as we couldn't connect to the server.");
        setUsingDefaultComments(true);
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

      // Try to create the comment via API
      let comment;
      try {
        comment = await api.createComment(card.id, newComment);
      } catch (apiError) {
        console.error("API error:", apiError);

        // If API fails, create a local comment instead
        if (usingDefaultComments) {
          // Generate a unique ID for the local comment
          const localId = `local-comment-${Date.now()}`;
          comment = {
            id: localId,
            ...newComment,
            createdAt: new Date().toISOString(),
            cardId: card.id
          };
        } else {
          // If we're not in default comments mode, throw the error to be caught below
          throw apiError;
        }
      }

      // Add the new comment to the list
      setComments([comment, ...comments]);
      setNewComment({ message: "", author: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to add comment:", err);
      // Don't show error message if we're already using default comments
      if (!usingDefaultComments) {
        setError("Failed to add comment. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        // Check if it's a local comment (created while offline)
        if (commentId.startsWith('local-comment-') || usingDefaultComments) {
          // For local comments, just remove from state without API call
          setComments(comments.filter(comment => comment.id !== commentId));
        } else {
          // For server comments, try to delete via API
          try {
            await api.deleteComment(commentId);
            setComments(comments.filter(comment => comment.id !== commentId));
          } catch (apiError) {
            console.error("API error:", apiError);

            // If we're in default comments mode, just remove from state
            if (usingDefaultComments) {
              setComments(comments.filter(comment => comment.id !== commentId));
            } else {
              throw apiError;
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to delete comment:", err);
        // Don't show error if we're already using default comments
        if (!usingDefaultComments) {
          setError("Failed to delete comment. Please try again.");
        }
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
                      if (card.id.startsWith('default-card-')) return;
                      try {
                        const updatedCard = await api.upvoteCard(card.id);
                        setCard(updatedCard);
                      } catch (err) {
                        console.error("Failed to upvote card:", err);
                      }
                    }}
                    className={`flex items-center mr-3 hover:text-green-600 ${card.id.startsWith('default-card-') ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    <span className="mr-1">👍</span>
                    <span className="font-medium">{card.votes}</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (card.id.startsWith('default-card-')) return;
                      try {
                        const updatedCard = await api.likeCard(card.id);
                        setCard(updatedCard);
                      } catch (err) {
                        console.error("Failed to like card:", err);
                      }
                    }}
                    className={`text-red-500 hover:text-red-700 flex items-center ${card.id.startsWith('default-card-') ? 'cursor-not-allowed opacity-70' : ''}`}
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
            {!usingDefaultComments ? (
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
            ) : (
              <div className="mb-6 p-3 bg-gray-100 border border-gray-200 rounded-md text-center text-gray-700">
                <p>Comment functionality is disabled in demo mode.</p>
              </div>
            )}

            {error && !usingDefaultComments ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-center mb-4">
                <p>{error}</p>
              </div>
            ) : null}

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
                      {!comment.id.startsWith('default-comment-') && !usingDefaultComments ? (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete comment"
                        >
                          🗑️
                        </button>
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed" title="Cannot delete demo comment">
                          🗑️
                        </span>
                      )}
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
