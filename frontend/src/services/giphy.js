const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || "suUmwl1F5d8UFKu2uIrfJZbe1Eq3Ki5g";
const GIPHY_API_URL = "https://api.giphy.com/v1/gifs";

export const fallbackGifs = [
  "https://media.giphy.com/media/3o6Zt6KHxJTbX20WTS/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/ZfK4cXKJTTay1Ava29/giphy.gif",
  "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif",
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif"
];

export const searchGifs = async (query, limit = 12) => {
  try {
    if (!query) {
      return { data: [] };
    }

    const response = await fetch(
      `${GIPHY_API_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
    );

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching GIFs:", error);
    return {
      data: fallbackGifs.map((url, i) => ({
        id: `fallback-${i}`,
        images: {
          fixed_height: {
            url: url
          },
          original: {
            url: url
          }
        }
      }))
    };
  }
};

export const getTrendingGifs = async (limit = 12) => {
  try {

    const response = await fetch(
      `${GIPHY_API_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
    );

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching trending GIFs:", error);
    return {
      data: fallbackGifs.map((url, i) => ({
        id: `fallback-${i}`,
        images: {
          fixed_height: {
            url: url
          },
          original: {
            url: url
          }
        }
      }))
    };
  }
};

export const formatGifData = (gifs) => {
  if (!gifs || !gifs.data) {
    return [];
  }

  return gifs.data.map(gif => ({
    id: gif.id,
    title: gif.title,
    url: gif.images.fixed_height.url,
    originalUrl: gif.images.original.url
  }));
};
