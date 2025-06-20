import React, { useState, useEffect } from "react";
import * as giphyService from "../services/giphy";

const GiphySelector = ({ onSelect, currentImage, onClear }) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  useEffect(() => {
    if (!currentImage && !results.length) {
      loadTrendingGifs();
    }
  }, [currentImage, results.length]);

  const loadTrendingGifs = async () => {
    setIsSearching(true);
    setShowTrending(true);
    try {
      const data = await giphyService.getTrendingGifs(12);
      const formattedGifs = giphyService.formatGifData(data);
      setResults(formattedGifs);
    } catch (error) {
      console.error("Error loading trending GIFs:", error);
      setResults(giphyService.fallbackGifs.map((url, i) => ({
        id: `fallback-${i}`,
        title: `Fallback GIF ${i+1}`,
        url: url,
        originalUrl: url
      })));
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      return;
    }

    setIsSearching(true);
    setShowTrending(false);

    try {
      const data = await giphyService.searchGifs(search, 12);
      const formattedGifs = giphyService.formatGifData(data);
      setResults(formattedGifs);
    } catch (error) {
      console.error("Error searching GIFs:", error);
      setResults(giphyService.fallbackGifs.map((url, i) => ({
        id: `fallback-${i}`,
        title: `Fallback GIF ${i+1}`,
        url: url,
        originalUrl: url
      })));
    } finally {
      setIsSearching(false);
    }
  };

  if (currentImage) {
    return (
      <div className="relative">
        <img
          src={currentImage}
          alt="Selected GIF"
          className="w-full h-32 object-cover rounded-md"
          onError={e => { e.target.src = giphyService.fallbackGifs[0]; }}
        />
        <button
          onClick={onClear}
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
          aria-label="Remove GIF"
        >✕</button>
      </div>
    );
  }

  return (
    <>
      <div className="flex">
        <input
          type="text"
          placeholder="Search for a GIF..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleSearch()}
          className="flex-1 px-3 py-2 border rounded-l-md text-black"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {isSearching ? (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-2">Searching for GIFs...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="mt-2">
          {showTrending && (
            <p className="text-sm text-gray-500 mb-2">Trending GIFs</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {results.map(gif => (
              <img
                key={gif.id}
                src={gif.url}
                alt={gif.title || "GIF"}
                className="w-full h-20 object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-md"
                onClick={() => {
                  onSelect(gif.originalUrl || gif.url);
                  setResults([]);
                  setSearch("");
                }}
                onError={e => { e.target.src = giphyService.fallbackGifs[0]; }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-2 text-sm text-gray-500">
          {search ? "No results found. Try a different search term." : "Search for GIFs or enter a URL below."}
        </div>
      )}

      <div className="mt-2">
        <p className="text-sm text-gray-500 mb-1">Or enter a GIPHY URL directly:</p>
        <input
          type="url"
          placeholder="https://media.giphy.com/media/..."
          onChange={e => onSelect(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-black"
        />
      </div>
    </>
  );
};

export default GiphySelector;
