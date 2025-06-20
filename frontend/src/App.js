import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BoardDetails from "./components/BoardDetails";
import GiphySelector from "./components/GiphySelector";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import * as api from "./services/api";


function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState({ title: "", description: "", category: "celebration", image: "", author: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllBoards = async () => {
      try {
        setLoading(true);
        const data = await api.fetchBoards();
        setBoards(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch boards:", err);
        setError("Failed to load boards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllBoards();
  }, []);

  const displayedBoards = filter === "recent"
    ? [...boards].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
    : boards.filter(board =>
        (filter === "all" || board.category === filter) &&
        (!searchQuery || board.title.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handleCreateBoard = async (e) => {
    e.preventDefault();

    if (!form.title || !form.image) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const newBoard = await api.createBoard(form);
      setBoards([newBoard, ...boards]);
      setForm({ title: "", description: "", category: "celebration", image: "", author: "" });
      setShowForm(false);
      setError(null);
    } catch (err) {
      console.error("Failed to create board:", err);
      setError("Failed to create board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (window.confirm("Are you sure you want to delete this board?")) {
      try {
        setLoading(true);
        await api.deleteBoard(id);
        setBoards(boards.filter(b => b.id !== id));
        setError(null);
      } catch (err) {
        console.error("Failed to delete board:", err);
        setError("Failed to delete board. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLikeBoard = async (id) => {
    try {
      const updatedBoard = await api.likeBoard(id);
      setBoards(boards.map(board =>
        board.id === id ? updatedBoard : board
      ));
      setError(null);
    } catch (err) {
      console.error("Failed to like board:", err);
      setError("Failed to like board. Please try again.");
    }
  };

  return (
    <div>
      <div className="bg-box rounded-lg shadow-md overflow-hidden mb-8 border border-dark">
        <div className="bg-darkgrey px-6 py-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center w-full text-white"
          >
            <span className="mr-2 font-bold">{showForm ? 'Hide Form' : 'Create a New Kudos Board'}</span>
            <span>{showForm ? '▲' : '▼'}</span>
          </button>
        </div>

        {showForm && (
          <div className="p-6 animate-fade-in border-t border-dark">
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Board Title*</label>
                <input
                  type="text"
                  placeholder="E.g., Team Appreciation"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  placeholder="What is this board for?"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-black"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category*</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md text-black"
                    required
                  >
                    <option value="celebration">Celebration</option>
                    <option value="thank you">Thank You</option>
                    <option value="inspiration">Inspiration</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">GIF*</label>
                  <GiphySelector
                    onSelect={(url) => setForm({ ...form, image: url })}
                    currentImage={form.image}
                    onClear={() => setForm({ ...form, image: "" })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Your Name (optional)</label>
                <input
                  type="text"
                  placeholder="Who's creating this board?"
                  value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md text-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-hotpink text-white py-2 px-4 rounded-md hover:bg-hotpink-dark btn-primary"
              >
                Create Board
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="bg-box rounded-lg shadow-md overflow-hidden mb-8 border border-dark">
        <div className="bg-darkgrey px-6 py-4 border-b border-dark">
          <h2 className="text-lg font-bold text-white">Search & Filter</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search boards by title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-3 focus:outline-none bg-box text-white border-dark"
              />
              <button
                className="bg-hotpink text-white px-4 py-3 hover:bg-hotpink-dark btn-primary"
                onClick={() => {/* Search functionality already handled by onChange */}}
              >
                Search
              </button>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center">
            <label className="mr-2 font-medium">Filter by:</label>
            <select
              onChange={e => setFilter(e.target.value)}
              value={filter}
              className="px-4 py-3 border rounded-md bg-box text-white border-dark focus:outline-none focus:ring-2 focus:ring-hotpink"
            >
              <option value="all">All Categories</option>
              <option value="recent">Recent (6)</option>
              <option value="celebration">Celebration</option>
              <option value="thank you">Thank You</option>
              <option value="inspiration">Inspiration</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
        </div>
        </div>
      </div>

      <div className="bg-box rounded-lg shadow-md overflow-hidden mb-8 border border-dark">
        <div className="bg-darkgrey px-6 py-4 border-b border-dark">
          <h2 className="text-xl font-bold text-white">Browse Boards</h2>
        </div>
        <div className="p-6">

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hotpink"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md text-center">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1 px-4 rounded"
              >
                Retry
              </button>
            </div>
          ) : displayedBoards.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md text-center">
              <p>No boards found {searchQuery ? "matching your search" : "in this category"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {displayedBoards.map(board => (
                <div key={board.id} className="bg-box rounded-md border border-dark overflow-hidden card-hover-effect">
                  <div className="relative">
                    <img
                      src={board.image}
                      alt={board.title}
                      className="w-full h-36 object-cover transition-opacity hover:opacity-95"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif";
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-center mb-2">
                      <h3 className="text-lg font-bold text-white text-center mr-2">{board.title}</h3>
                      <button
                        onClick={() => handleLikeBoard(board.id)}
                        className="text-white hover:text-red-500 focus:outline-none"
                      >
                        {board.likes > 0 ? '❤️' : '🤍'} {board.likes || 0}
                      </button>
                    </div>

                    <div className="flex justify-center mt-2">
                      <Link
                        to={`/boards/${board.id}`}
                        className="bg-hotpink text-white px-4 py-1 rounded-md hover:bg-hotpink-dark mr-2"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteBoard(board.id)}
                        className="bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Footer = () => {
  return (
    <footer className="bg-darkgrey text-white py-4 border-t border-dark">
      <div className="container mx-auto px-4 text-center">
        <p className="text-xl font-bold">Kudos Board</p>
      </div>
    </footer>
  );
};

const Header = () => {
  const { theme } = useTheme();

  return (
    <header className={`${theme === 'light' ? 'bg-lightDarkgrey text-dark border-lightBorder' : 'bg-darkgrey text-white border-dark'} shadow-md mb-8 border-b transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-8 border-b border-gray-100">
          <Link to="/" className={`text-2xl font-bold ${theme === 'light' ? 'text-dark' : 'text-white'}`}>
            Kudos Board
          </Link>
          <nav className="flex items-center">
            <ul className="flex space-x-6 items-center mr-4">
              <li><Link to="/" className={`${theme === 'light' ? 'text-dark' : 'text-white'} hover:text-hotpink font-medium`}>Home</Link></li>
              <li><a href="#" className={`${theme === 'light' ? 'text-dark' : 'text-white'} hover:text-hotpink font-medium`}>About</a></li>
            </ul>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};

const Banner = () => {
  return (
    <div className="bg-box shadow-md rounded-lg overflow-hidden mb-8 border border-dark">
      <div className="bg-header text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Kudos Board</h1>
          <p className="text-xl mb-4">For those who love to create & create to love</p>
        </div>
      </div>
      <div className="bg-box p-6 border-t border-dark">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="bg-box p-4 rounded-lg flex-1 border border-hotpink">
            <h3 className="font-bold text-white">Create Boards</h3>
          </div>
          <div className="bg-box p-4 rounded-lg flex-1 border border-hotpink">
            <h3 className="font-bold text-white">Add Cards</h3>
          </div>
          <div className="bg-box p-4 rounded-lg flex-1 border border-hotpink">
            <h3 className="font-bold text-white">Upvote cards</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-lightBg' : 'bg-black'} transition-colors duration-300`}>
      <Header />
      <main className="flex-grow container mx-auto px-4 pb-12">
        <Routes>
          <Route path="/" element={<><Banner /><Dashboard /></>} />
          <Route path="/boards/:id" element={<BoardDetails />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
