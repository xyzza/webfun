import { Game } from './Game';
import { getConfig, parseLevelFromURL } from './config';
import './style.css';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing Arcade Platformer...');

  try {
    const config = getConfig();
    let startingLevelId = config.defaultLevelId;

    // Debug mode: parse level from URL
    if (config.debug) {
      const urlLevel = parseLevelFromURL();
      if (urlLevel) {
        startingLevelId = urlLevel;
        console.log(`[DEBUG] Starting with level from URL: ${startingLevelId}`);
      }
    }

    const game = new Game('gameCanvas', startingLevelId);
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
    console.log('  Space/W/Up Arrow - Jump / Slow down fall (Level 2)');
    console.log('  S/Down Arrow - Speed up fall (Level 2)');
    console.log('  ESC or P - Pause');
    console.log('  R - Restart (when game over)');

    if (config.debug) {
      console.log('\n[DEBUG MODE ENABLED]');
      console.log('Add level number to URL to start from specific level:');
      console.log('  /1 or /webfun/1 - Level 1');
      console.log('  /2 or /webfun/2 - Level 2');
    }
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
});
