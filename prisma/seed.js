const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleGifs = [
  "https://media.giphy.com/media/3o6Zt6KHxJTbX20WTS/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/ZfK4cXKJTTay1Ava29/giphy.gif",
  "https://media.giphy.com/media/xTiN0L7EW5trfOvEk0/giphy.gif",
  "https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif",
  "https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif"
];

const sampleBoards = [
  {
    title: "Team Appreciation",
    description: "Share your appreciation with the team members who've gone above and beyond!",
    category: "celebration",
    image: sampleGifs[0],
    author: "Team Lead",
    cards: [
      {
        title: "Great work on the launch!",
        message: "Your dedication and hard work made our product launch a huge success. Thank you for all the late nights and attention to detail.",
        image: sampleGifs[1],
        author: "Sarah",
        votes: 5
      },
      {
        title: "Thanks for the mentorship",
        message: "I've learned so much from working with you. Your guidance has been invaluable to my professional growth.",
        image: sampleGifs[2],
        author: "Michael",
        votes: 3
      }
    ]
  },
  {
    title: "Project Milestone",
    description: "We've reached 1000 users! Let's celebrate this amazing achievement together.",
    category: "celebration",
    image: sampleGifs[3],
    author: "Product Manager",
    cards: [
      {
        title: "Excellent customer service",
        message: "You went above and beyond for our clients! Your dedication to customer satisfaction is truly inspiring.",
        image: sampleGifs[4],
        author: "Client Success Manager",
        votes: 7
      }
    ]
  },
  {
    title: "Customer Support be like",
    description: "Recognize our support team for their hard work and dedication to our customers.",
    category: "thank you",
    image: sampleGifs[5],
    author: "Support Manager",
    cards: []
  },
  {
    title: "Stating the Obvious",
    description: "Share your innovative ideas and inspirations for our next big project!",
    category: "inspiration",
    image: sampleGifs[2],
    author: "Innovation Team",
    cards: [
      {
        title: "AI-powered customer insights",
        message: "What if we used machine learning to analyze customer feedback and automatically identify trends and pain points?",
        image: sampleGifs[0],
        author: "Data Scientist",
        votes: 10
      }
    ]
  },
  {
    title: "Feedback",
    description: "A safe space to share constructive feedback and help us all grow together.",
    category: "feedback",
    image: sampleGifs[4],
    author: "HR Director",
    cards: []
  }
];

async function main() {
  console.log('Starting to seed the database...');

  await prisma.card.deleteMany({});
  await prisma.board.deleteMany({});
  console.log('Cleared existing data');

  for (const boardData of sampleBoards) {
    const { cards, ...board } = boardData;

    const createdBoard = await prisma.board.create({
      data: {
        ...board,
        cards: {
          create: cards
        }
      },
      include: {
        cards: true
      }
    });

    console.log(`Created board: ${createdBoard.title} with ${createdBoard.cards.length} cards`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
