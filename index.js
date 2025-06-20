const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { validateBoardRequest, validateCardRequest } = require('./middleware/validation');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Kudos Board API' });
});

app.get('/api/boards', async (_req, res) => {
  try {
    const boards = await prisma.board.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

app.get('/api/boards/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const board = await prisma.board.findUnique({
      where: { id },
      include: { cards: true }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

app.post('/api/boards', validateBoardRequest, async (req, res) => {
  try {
    const { title, description, category, image, author } = req.body;

    const newBoard = await prisma.board.create({
      data: {
        title,
        description,
        category,
        image,
        author
      }
    });

    res.status(201).json(newBoard);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(500).json({ error: 'Failed to create board' });
  }
});

app.put('/api/boards/:id', validateBoardRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, image, author } = req.body;

    const updatedBoard = await prisma.board.update({
      where: { id },
      data: {
        title,
        description,
        category,
        image,
        author
      }
    });

    res.json(updatedBoard);
  } catch (error) {
    console.error('Error updating board:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.status(500).json({ error: 'Failed to update board' });
  }
});

app.delete('/api/boards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.board.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting board:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.status(500).json({ error: 'Failed to delete board' });
  }
});

app.get('/api/boards/:boardId/cards', async (req, res) => {
  try {
    const { boardId } = req.params;

    const cards = await prisma.card.findMany({
      where: { boardId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(cards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.post('/api/boards/:boardId/cards', validateCardRequest, async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, message, image, author } = req.body;

    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const newCard = await prisma.card.create({
      data: {
        title,
        message,
        image,
        author,
        boardId
      }
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ error: 'Failed to create card' });
  }
});

app.put('/api/cards/:id', validateCardRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, image, author } = req.body;

    const updatedCard = await prisma.card.update({
      where: { id },
      data: {
        title,
        message,
        image,
        author
      }
    });

    res.json(updatedCard);
  } catch (error) {
    console.error('Error updating card:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(500).json({ error: 'Failed to update card' });
  }
});

app.delete('/api/cards/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.card.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting card:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(500).json({ error: 'Failed to delete card' });
  }
});

app.post('/api/cards/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.update({
      where: { id },
      data: {
        votes: {
          increment: 1
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error upvoting card:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(500).json({ error: 'Failed to upvote card' });
  }
});

app.post('/api/cards/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    const card = await prisma.card.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      }
    });

    res.json(card);
  } catch (error) {
    console.error('Error liking card:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.status(500).json({ error: 'Failed to like card' });
  }
});

app.post('/api/boards/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      }
    });

    res.json(board);
  } catch (error) {
    console.error('Error liking board:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Board not found' });
    }

    res.status(500).json({ error: 'Failed to like board' });
  }
});

app.get('/api/cards/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: { cardId: id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

app.post('/api/cards/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, author } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const card = await prisma.card.findUnique({
      where: { id }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        message,
        author,
        cardId: id
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.comment.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
