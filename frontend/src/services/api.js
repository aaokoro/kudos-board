const API_URL = 'http://localhost:3000/api';

const createHeaders = (contentType = true) => {
  return contentType ? { 'Content-Type': 'application/json' } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
};

export const fetchBoards = async () => {
  try {
    const response = await fetch(`${API_URL}/boards`, {
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching boards:', error);
    throw error;
  }
};

export const fetchBoardById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/boards/${id}`, {
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching board ${id}:`, error);
    throw error;
  }
};

export const createBoard = async (boardData) => {
  try {
    const response = await fetch(`${API_URL}/boards`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};

export const updateBoard = async (id, boardData) => {
  try {
    const response = await fetch(`${API_URL}/boards/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(boardData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating board ${id}:`, error);
    throw error;
  }
};

export const deleteBoard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/boards/${id}`, {
      method: 'DELETE',
      headers: createHeaders(false),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error(`Error deleting board ${id}:`, error);
    throw error;
  }
};

export const fetchCardsByBoardId = async (boardId) => {
  try {
    const response = await fetch(`${API_URL}/boards/${boardId}/cards`, {
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching cards for board ${boardId}:`, error);
    throw error;
  }
};

export const createCard = async (boardId, cardData) => {
  try {
    const response = await fetch(`${API_URL}/boards/${boardId}/cards`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(cardData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error creating card for board ${boardId}:`, error);
    throw error;
  }
};

export const updateCard = async (id, cardData) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(cardData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error updating card ${id}:`, error);
    throw error;
  }
};

export const deleteCard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: 'DELETE',
      headers: createHeaders(false),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error(`Error deleting card ${id}:`, error);
    throw error;
  }
};

export const upvoteCard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}/upvote`, {
      method: 'POST',
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error upvoting card ${id}:`, error);
    throw error;
  }
};

export const likeCard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/cards/${id}/like`, {
      method: 'POST',
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error liking card ${id}:`, error);
    throw error;
  }
};

export const likeBoard = async (id) => {
  try {
    const response = await fetch(`${API_URL}/boards/${id}/like`, {
      method: 'POST',
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error liking board ${id}:`, error);
    throw error;
  }
};

export const fetchComments = async (cardId) => {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/comments`, {
      headers: createHeaders(false),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error fetching comments for card ${cardId}:`, error);
    throw error;
  }
};

export const createComment = async (cardId, commentData) => {
  try {
    const response = await fetch(`${API_URL}/cards/${cardId}/comments`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(commentData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error(`Error creating comment for card ${cardId}:`, error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await fetch(`${API_URL}/comments/${id}`, {
      method: 'DELETE',
      headers: createHeaders(false),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return true; // Successfully deleted
  } catch (error) {
    console.error(`Error deleting comment ${id}:`, error);
    throw error;
  }
};
