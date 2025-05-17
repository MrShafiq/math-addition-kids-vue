# Math Addition Game for Kids

A fun and interactive math game built with Vue.js and Bootstrap, designed to help kids learn addition.

## Features

- Drag and drop interface for answering math questions
- Random question generation (sums up to 20)
- Visual feedback for correct/incorrect answers
- Score tracking
- Responsive design for all devices
- Sound effects for better engagement

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd math-addition-kids-vue
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Technologies Used

- Vue.js 3
- TypeScript
- Bootstrap 5
- Pinia (State Management)
- Howler.js (Sound Effects)

## Project Structure

```
src/
├── components/
│   ├── MathGame.vue      # Main game component
│   ├── QuestionCard.vue  # Individual question card
│   └── AnswerBank.vue    # Draggable answer bank
├── stores/
│   └── game.ts          # Game state management
├── types/
│   └── index.ts         # TypeScript interfaces
└── assets/
    └── sounds/          # Sound effects
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 