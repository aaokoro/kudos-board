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

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        setLoading(true);
        const boardData = await api.fetchBoardById(id);
        setBoard(boardData);

        const cardsData = await api.fetchCardsByBoardId(id);
        setCards(cardsData);

        setError(null);
      } catch (err) {
        console.error("Failed to fetch board details:", err);
        setError("Failed to load board details. Please try again later.");
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
      const newCard = await api.createCard(id, cardForm);
      setCards([newCard, ...cards]);
      setCardForm({ title: "", message: "", image: "", author: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to create card:", err);
      setError("Failed to create card. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpvote = async (cardId) => {
    try {
      const updatedCard = await api.upvoteCard(cardId);
      setCards(cards.map(card =>
        card.id === cardId ? updatedCard : card
      ));
      setError(null);
    } catch (err) {
      console.error("Failed to upvote card:", err);
      setError("Failed to upvote card. Please try again.");
    }
  };

  const handleLike = async (cardId) => {
    try {
      const updatedCard = await api.likeCard(cardId);
      setCards(cards.map(card =>
        card.id === cardId ? updatedCard : card
      ));
      setError(null);
    } catch (err) {
      console.error("Failed to like card:", err);
      setError("Failed to like card. Please try again.");
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        setLoading(true);
        await api.deleteCard(cardId);
        setCards(cards.filter(card => card.id !== cardId));
        setError(null);
      } catch (err) {
        console.error("Failed to delete card:", err);
        setError("Failed to delete card. Please try again.");
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

  if (error && !board) {
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
                          handleUpvote(card.id);
                        }}
                        className="bg-white rounded-full p-1 shadow-sm text-gray-600 hover:text-green-600 focus-visible flex items-center"
                      >
                        <span className="mr-1">👍</span>
                        <span className="text-xs font-medium">{card.votes}</span>
                      </button>
                    </div>
                  </div>

                  {card.message && (
                    <p className={`mt-2 ${theme === 'light' ? 'text-dark' : 'text-white'} text-sm line-clamp-2`}>{card.message}</p>
                  )}

                  <div className={`mt-3 pt-2 border-t ${theme === 'light' ? 'border-lightBorder' : 'border-dark'} flex justify-between items-center text-xs ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
                    <div className="flex items-center">
                      <span className="mr-1">👍</span>
                      <span className="font-medium">{card.votes}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCard(card);
                        }}
                        className="ml-2 text-hotpink hover:text-white focus-visible"
                      >
                        💬
                      </button>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(card.id);
                        }}
                        className="bg-hotpink text-white px-2 py-1 rounded-md hover:bg-hotpink-dark mr-2"
                      >
                        ❤️ {card.likes || 0}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCard(card.id);
                        }}
                        className="text-red-600 hover:text-red-800 focus-visible px-2 py-1"
                      >
                        🗑️
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
