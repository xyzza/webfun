# Arcade Platformer Game

A classic arcade-style platformer game built with TypeScript and HTML5 Canvas.

[![Deploy to GitHub Pages](https://github.com/xyzza/webfun/actions/workflows/deploy.yml/badge.svg)](https://github.com/xyzza/webfun/actions/workflows/deploy.yml)

[[Game](https://xyzza.github.io/webfun)]

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

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### GitHub Pages Setup

1. Go to your repository settings on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push to `main` or `master` branch to trigger deployment

The workflow will automatically:
- Build the project
- Deploy to GitHub Pages
- Make the game available at `https://<username>.github.io/Webfun/`

### Manual Deployment

You can also trigger deployment manually:
1. Go to **Actions** tab in your GitHub repository
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Custom Domain

To use a custom domain:
1. Update `base` in `vite.config.ts` to `'/'`
2. Add your custom domain in repository settings
3. Add a `CNAME` file in the `public/` directory with your domain

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
