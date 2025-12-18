import { Game } from './Game';
import './style.css';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Arcade Platformer...');

  try {
    const game = new Game('gameCanvas');
    game.start();

    // Handle window visibility for pausing
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('Game paused (tab hidden)');
      } else {
        console.log('Game resumed (tab visible)');
      }
    });

    console.log('Game initialized successfully!');
    console.log('Controls:');
    console.log('  Arrow Keys or WASD - Move');
    console.log('  Space/W/Up Arrow - Jump');
    console.log('  ESC or P - Pause');
    console.log('  R - Restart (when game over)');
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
});
