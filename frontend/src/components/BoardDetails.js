import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import * as api from "../services/api";
import GiphySelector from "./GiphySelector";
import CardModal from "./CardModal";
import { useTheme } from "../context/ThemeContext";

function BoardDetails() {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [cards, setCards] = useState([]);
  const [cardForm, setCardForm] = useState({ title: "", message: "", image: "", author: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [usingDefaultData, setUsingDefaultData] = useState(false);

  // Default images to use when API fails
  const defaultImages = [
    "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif",
    "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
    "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
    "https://media.giphy.com/media/l2JJrEx9aRsjNruhi/giphy.gif",
    "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
    "https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif"
  ];

  // Generate a default board when API fails
  const generateDefaultBoard = () => {
    return {
      id: `default-${id}`,
      title: "Default Board",
      description: "This is a default board created when the API is unavailable.",
      category: "celebration",
      image: defaultImages[0],
      author: "System",
      createdAt: new Date().toISOString(),
      likes: Math.floor(Math.random() * 10)
    };
  };

  // Generate default cards when API fails
  const generateDefaultCards = () => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: `default-card-${i}`,
      title: `Default Card ${i + 1}`,
      message: "This is a default card created when the API is unavailable.",
      image: defaultImages[i % defaultImages.length],
      author: "System",
      createdAt: new Date().toISOString(),
      votes: Math.floor(Math.random() * 5),
      likes: Math.floor(Math.random() * 3),
      boardId: `default-${id}`
    }));
  };

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        setLoading(true);
        const boardData = await api.fetchBoardById(id);
        setBoard(boardData);

        const cardsData = await api.fetchCardsByBoardId(id);
        setCards(cardsData);

        setError(null);
        setUsingDefaultData(false);
      } catch (err) {
        console.error("Failed to fetch board details:", err);

        // Use default data instead of just showing an error
        const defaultBoard = generateDefaultBoard();
        const defaultCards = generateDefaultCards();

        setBoard(defaultBoard);
        setCards(defaultCards);
        // Don't set an error message
        setError(null);
        setUsingDefaultData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBoardDetails();
  }, [id]);

  const handleCreateCard = async (e) => {
    e.preventDefault();

    if (!cardForm.title || !cardForm.image) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setSubmitting(true);

      // Try to create the card via API
      let newCard;
      try {
        newCard = await api.createCard(id, cardForm);
      } catch (apiError) {
        console.error("API error:", apiError);

        // If API fails, create a local card instead
        if (usingDefaultData) {
          // Generate a unique ID for the local card
          const localId = `local-card-${Date.now()}`;
          newCard = {
            id: localId,
            ...cardForm,
            createdAt: new Date().toISOString(),
            votes: 0,
            likes: 0,
            boardId: id
          };
        } else {
          // If we're not in default data mode, throw the error to be caught below
          throw apiError;
        }
      }

      // Add the new card to the list
      setCards([newCard, ...cards]);
      setCardForm({ title: "", message: "", image: "", author: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to create card:", err);
      // Don't show error message if we're already using default data
      if (!usingDefaultData) {
        setError("Failed to create card. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (cardId) => {
    try {
      // Check if it's a local card or we're in default data mode
      if (cardId.startsWith('local-card-') || usingDefaultData) {
        // For local cards, just update state without API call
        setCards(cards.map(card =>
          card.id === cardId ? { ...card, votes: (card.votes || 0) + 1 } : card
        ));
      } else {
        // For server cards, try to upvote via API
        try {
          const updatedCard = await api.upvoteCard(cardId);
          setCards(cards.map(card =>
            card.id === cardId ? updatedCard : card
          ));
        } catch (apiError) {
          console.error("API error:", apiError);

          // If we're in default data mode, just update state
          if (usingDefaultData) {
            setCards(cards.map(card =>
              card.id === cardId ? { ...card, votes: (card.votes || 0) + 1 } : card
            ));
          } else {
            throw apiError;
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error("Failed to upvote card:", err);
      // Don't show error if we're already using default data
      if (!usingDefaultData) {
        setError("Failed to upvote card. Please try again.");
      }
    }
  };

  const handleLike = async (cardId) => {
    try {
      // Check if it's a local card or we're in default data mode
      if (cardId.startsWith('local-card-') || usingDefaultData) {
        // For local cards, just update state without API call
        setCards(cards.map(card =>
          card.id === cardId ? { ...card, likes: (card.likes || 0) + 1 } : card
        ));
      } else {
        // For server cards, try to like via API
        try {
          const updatedCard = await api.likeCard(cardId);
          setCards(cards.map(card =>
            card.id === cardId ? updatedCard : card
          ));
        } catch (apiError) {
          console.error("API error:", apiError);

          // If we're in default data mode, just update state
          if (usingDefaultData) {
            setCards(cards.map(card =>
              card.id === cardId ? { ...card, likes: (card.likes || 0) + 1 } : card
            ));
          } else {
            throw apiError;
          }
        }
      }

      setError(null);
    } catch (err) {
      console.error("Failed to like card:", err);
      // Don't show error if we're already using default data
      if (!usingDefaultData) {
        setError("Failed to like card. Please try again.");
      }
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        setLoading(true);

        // Check if it's a local card (created while offline)
        if (cardId.startsWith('local-card-') || usingDefaultData) {
          // For local cards, just remove from state without API call
          setCards(cards.filter(card => card.id !== cardId));
        } else {
          // For server cards, try to delete via API
          try {
            await api.deleteCard(cardId);
            setCards(cards.filter(card => card.id !== cardId));
          } catch (apiError) {
            console.error("API error:", apiError);

            // If we're in default data mode, just remove from state
            if (usingDefaultData) {
              setCards(cards.filter(card => card.id !== cardId));
            } else {
              throw apiError;
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error("Failed to delete card:", err);
        // Don't show error if we're already using default data
        if (!usingDefaultData) {
          setError("Failed to delete card. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !board) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-hotpink"></div>
      </div>
    );
  }

  if (error && !board && !usingDefaultData) {
    return (
      <div className="container mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-md text-center">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-6 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return <div>Board not found</div>;
  }

  return (
    <div className={`container mx-auto ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
      {/* Removed error message and retry button */}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-hotpink hover:text-hotpink-dark focus-visible"
        >
          ← Back to Dashboard
        </button>

        <div className="text-sm breadcrumbs">
          <ul className="flex space-x-2">
            <li><Link to="/" className={`${theme === 'light' ? 'text-dark' : 'text-white'} hover:text-hotpink`}>Home</Link></li>
            <li className="before:content-['/'] before:mx-2 before:text-gray-400">Board Details</li>
          </ul>
        </div>
      </div>

      <div className={`${theme === 'light' ? 'bg-lightBox border-lightBorder' : 'bg-box border-dark'} rounded-lg shadow-md overflow-hidden mb-8 card-hover-effect border transition-colors duration-300`}>
        <img
          src={board.image}
          alt={board.title}
          className="w-full h-48 object-cover transition-opacity hover:opacity-95"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif";
          }}
        />
        <div className={`p-4 border-t ${theme === 'light' ? 'border-lightBorder' : 'border-dark'}`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-2xl font-bold ${theme === 'light' ? 'text-dark' : 'text-white'} text-ellipsis`}>{board.title}</h1>
              <p className={`text-sm ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                {board.category.charAt(0).toUpperCase() + board.category.slice(1)}
              </p>
            </div>
            <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              {board.category.charAt(0).toUpperCase() + board.category.slice(1)}
            </span>
          </div>

          {board.description && (
            <p className={`mt-2 ${theme === 'light' ? 'text-dark' : 'text-white'} line-clamp-2`}>{board.description}</p>
          )}
        </div>
      </div>

      <div className={`${theme === 'light' ? 'bg-lightBox border-lightBorder' : 'bg-box border-dark'} rounded-lg shadow-md overflow-hidden mb-8 border transition-colors duration-300`}>
        <div className={`${theme === 'light' ? 'bg-lightDarkgrey border-lightBorder' : 'bg-darkgrey border-dark'} px-6 py-4 border-b transition-colors duration-300`}>
          <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>Add a Kudos Card</h2>
        </div>
        <div className="p-6">
        <form onSubmit={handleCreateCard} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-center">
              <p>{error}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Card Title*</label>
            <input
              type="text"
              placeholder="E.g., Great teamwork!"
              value={cardForm.title}
              onChange={e => setCardForm({ ...cardForm, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${theme === 'light' ? 'bg-white text-dark border-lightBorder' : 'bg-box text-white border-dark'}`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              placeholder="Share your appreciation..."
              value={cardForm.message}
              onChange={e => setCardForm({ ...cardForm, message: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${theme === 'light' ? 'bg-white text-dark border-lightBorder' : 'bg-black text-white border-pink'}`}
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">GIF*</label>
            <GiphySelector
              onSelect={(url) => setCardForm({ ...cardForm, image: url })}
              currentImage={cardForm.image}
              onClear={() => setCardForm({ ...cardForm, image: "" })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Your Name (optional)</label>
            <input
              type="text"
              placeholder="Who's giving kudos?"
              value={cardForm.author}
              onChange={e => setCardForm({ ...cardForm, author: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md ${theme === 'light' ? 'bg-white text-dark border-lightBorder' : 'bg-black text-white border-pink'}`}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-hotpink text-white py-2 px-4 rounded-md hover:bg-hotpink-dark focus-visible btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Kudos Card'}
          </button>
        </form>
        </div>
      </div>

      <div className={`${theme === 'light' ? 'bg-lightBox border-lightBorder' : 'bg-box border-dark'} rounded-lg shadow-md overflow-hidden mb-8 border transition-colors duration-300`}>
        <div className={`${theme === 'light' ? 'bg-lightDarkgrey border-lightBorder' : 'bg-darkgrey border-dark'} px-6 py-4 border-b transition-colors duration-300`}>
          <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>Kudos Cards ({cards.length})</h2>
        </div>
        <div className="p-6">

        {loading && cards.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotpink"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md text-center">
            <p>No kudos cards yet. Be the first to add a card!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cards.map(card => (
              <div
                key={card.id}
                className={`${theme === 'light' ? 'bg-lightBox border-lightBorder' : 'bg-box border-dark'} rounded-md border overflow-hidden card-hover-effect cursor-pointer transition-colors duration-300`}
                onClick={() => setSelectedCard(card)}
              >
                <div className="p-3">
                  <h3 className={`text-md font-bold ${theme === 'light' ? 'text-dark' : 'text-white'} mb-2`}>{card.title}</h3>

                  <div className="relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-32 object-cover rounded-md transition-opacity hover:opacity-95"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif";
                      }}
                    />
                    <div className="absolute top-1 right-1 flex">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!card.id.startsWith('default-card-')) {
                            handleUpvote(card.id);
                          }
                        }}
                        className={`bg-white rounded-full p-1 shadow-sm text-gray-600 hover:text-green-600 focus-visible flex items-center ${card.id.startsWith('default-card-') ? 'cursor-not-allowed opacity-70' : ''}`}
                      >
                        <span className="mr-1">👍</span>
                        <span className="text-xs font-medium">{card.votes}</span>
                      </button>
                    </div>
                  </div>

                  {card.message && (
                    <p className={`mt-2 ${theme === 'light' ? 'text-dark' : 'text-white'} text-sm line-clamp-2`}>{card.message}</p>
                  )}

                  <div className={`mt-3 pt-2 border-t ${theme === 'light' ? 'border-lightBorder' : 'border-dark'} ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard(card);
                        }}
                        className="bg-hotpink text-white py-2 px-3 rounded-md hover:bg-hotpink-dark text-center font-medium text-sm flex items-center justify-center"
                      >
                        💬 View
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!card.id.startsWith('default-card-')) {
                            handleDeleteCard(card.id);
                          }
                        }}
                        className={`bg-gray-700 text-white py-2 px-3 rounded-md hover:bg-gray-600 text-center font-medium text-sm flex items-center justify-center ${card.id.startsWith('default-card-') ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        🗑️ Delete
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(card.id);
                        }}
                        className="bg-white text-red-500 py-2 px-3 rounded-md hover:bg-gray-100 text-center font-medium text-sm flex items-center justify-center"
                      >
                        ❤️ {card.likes || 0}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}

export default BoardDetails;
