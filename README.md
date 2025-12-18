# Arcade Platformer Game

A classic arcade-style platformer game built with TypeScript and HTML5 Canvas.

## Features

- Physics-based player movement with gravity and jumping
- Multiple platforms to navigate
- Score tracking and lives system
- Pause functionality
- Responsive controls

## Controls

- **Arrow Keys** or **WASD** - Move left/right
- **Space** / **W** / **Up Arrow** - Jump
- **ESC** or **P** - Pause/Resume
- **R** - Restart (when game over)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── main.ts          # Entry point
│   ├── Game.ts          # Main game class with game loop
│   ├── Player.ts        # Player character with physics
│   ├── Platform.ts      # Platform objects
│   ├── InputManager.ts  # Keyboard input handling
│   ├── types.ts         # TypeScript interfaces
│   ├── style.css        # Additional styles
│   └── assets/          # Game assets (images, sounds, etc.)
├── public/              # Static files
├── index.html           # HTML entry point
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies

```

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **HTML5 Canvas** - 2D rendering
- **Vanilla JavaScript** - No game engine dependencies

## Future Enhancements

- Add collectible items (coins, power-ups)
- Implement enemies and combat
- Add multiple levels
- Include sound effects and music
- Create a level editor
- Add local storage for high scores

## License

ISC
