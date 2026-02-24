import React, { useState } from "react";

// Hard-coded Aggie Pride themed GIFs/images (no external API calls)
const AGGIE_GIFS = [
  {
    id: "aggie-1",
    title: "Aggie Pride!",
    url: "https://media.giphy.com/media/3o6Zt6KHxJTbX20WTS/giphy.gif",
  },
  {
    id: "aggie-2",
    title: "Blue & Gold Energy",
    url: "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif",
  },
  {
    id: "aggie-3",
    title: "Victory on The Yard",
    url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  },
  {
    id: "aggie-4",
    title: "Celebration Band",
    url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  },
  {
    id: "aggie-5",
    title: "Blue & Gold March",
    url: "https://media.giphy.com/media/l2JJrEx9aRsjNruhi/giphy.gif",
  },
  {
    id: "aggie-6",
    title: "Homecoming Vibes",
    url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
  },
];

const GiphySelector = ({ onSelect, currentImage, onClear }) => {
  const [search, setSearch] = useState("");

  const filteredGifs = AGGIE_GIFS.filter((gif) =>
    gif.title.toLowerCase().includes(search.toLowerCase())
  );

  if (currentImage) {
    return (
      <div className="relative">
        <img
          src={currentImage}
          alt="Selected GIF"
          className="w-full h-32 object-cover rounded-md"
          onError={e => { e.target.src = AGGIE_GIFS[0].url; }}
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
          placeholder="Search Aggie GIFs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-black"
        />
      </div>

      <div className="mt-2">
        {filteredGifs.length === 0 ? (
          <div className="text-center py-2 text-sm text-gray-500">
            No Aggie GIFs match that search.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {filteredGifs.map(gif => (
              <img
                key={gif.id}
                src={gif.url}
                alt={gif.title}
                title={gif.title}
                className="w-full h-20 object-cover cursor-pointer border-2 border-transparent hover:border-blue-500 rounded-md"
                onClick={() => onSelect(gif.url)}
                onError={e => { e.target.src = AGGIE_GIFS[0].url; }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default GiphySelector;
