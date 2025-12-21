import { Player } from './Player';
import { Platform } from './Platform';
import { InputManager } from './InputManager';
import type { GameState } from './types';
import { LevelManager } from './levels/LevelManager';
import { getStartingLevelId } from './levels/level-configs/index';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private platforms: Platform[] = [];
  private inputManager: InputManager;
  private levelManager: LevelManager;
  private lastTime: number = 0;
  private animationId: number = 0;
  private wasGrounded: boolean = false;

  private state: GameState = {
    score: 0,
    lives: 3,
    isGameOver: false,
    isPaused: false,
    currentLevelId: '',
    levelCompleted: false,
    levelStartTime: 0,
  };

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    this.inputManager = new InputManager();
    this.player = new Player(100, 100);
    this.levelManager = new LevelManager();

    // Load starting level
    this.loadLevel(getStartingLevelId());
  }

  private loadLevel(levelId: string): void {
    const config = this.levelManager.loadLevel(levelId);

    // Update state
    this.state.currentLevelId = levelId;
    this.state.levelCompleted = false;
    this.state.levelStartTime = Date.now();

    // Create platforms
    this.platforms = this.levelManager.createPlatforms(config);

    // Configure player
    const playerConfig = this.levelManager.getPlayerConfig();
    this.player.configure(playerConfig.physics, playerConfig.features);

    // Reset player position
    this.player.reset(config.spawnPosition.x, config.spawnPosition.y);

    // Update UI
    this.updateUI();
  }

  private update(deltaTime: number): void {
    if (this.state.isGameOver || this.state.isPaused) {
      return;
    }

    // Update player
    this.player.update(deltaTime, this.inputManager, this.platforms, this.canvas.width, this.canvas.height);

    // Check if player fell off the screen (only if vertical wrapping disabled)
    const config = this.levelManager.getCurrentConfig();
    const hasVerticalWrapping = config?.features.verticalScreenWrapping ?? false;

    if (!hasVerticalWrapping && this.player.position.y > this.canvas.height) {
      this.loseLife();
    }

    // Update score (simple time-based scoring)
    this.state.score += Math.floor(deltaTime * 10);

    // Check for landing on non-goal platform
    const isGrounded = this.player.getIsGrounded();
    if (config?.features.resetOnNonGoalPlatform && !this.wasGrounded && isGrounded) {
      // Player just landed - check which platform
      const landedPlatformIndex = this.findLandedPlatform();
      const goalPlatformIndex = config.winCondition.type === 'reach_platform'
        ? config.winCondition.platformIndex ?? -1
        : -1;

      if (landedPlatformIndex !== -1 && landedPlatformIndex !== goalPlatformIndex) {
        // Landed on wrong platform - reset to first platform
        const firstPlatform = this.platforms[0];
        if (firstPlatform) {
          const bounds = firstPlatform.getBounds();
          this.player.reset(bounds.x + bounds.width / 2 - this.player.width / 2, bounds.y - this.player.height - 5);
        }
      }
    }
    this.wasGrounded = isGrounded;

    // Check win condition
    if (!this.state.levelCompleted &&
        this.levelManager.checkWinCondition(this.state, this.platforms, this.player.position)) {
      this.onLevelComplete();
    }

    this.updateUI();
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render platforms
    for (const platform of this.platforms) {
      platform.render(this.ctx);
    }

    // Render player
    this.player.render(this.ctx);

    // Render game over screen
    if (this.state.isGameOver) {
      this.renderGameOver();
    }

    // Render level complete screen
    if (this.state.levelCompleted && !this.state.isGameOver) {
      this.renderLevelComplete();
    }

    // Render pause screen (but not if level is complete)
    if (this.state.isPaused && !this.state.levelCompleted) {
      this.renderPaused();
    }
  }

  private renderGameOver(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e94560';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(
      `Final Score: ${this.state.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 20
    );

    this.ctx.font = '18px Arial';
    this.ctx.fillText(
      'Press R to Restart',
      this.canvas.width / 2,
      this.canvas.height / 2 + 60
    );
  }

  private renderPaused(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#e94560';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '18px Arial';
    this.ctx.fillText(
      'Press ESC or P to Resume',
      this.canvas.width / 2,
      this.canvas.height / 2 + 40
    );
  }

  private renderLevelComplete(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#4CAF50';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width / 2, this.canvas.height / 2 - 40);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(
      `Score: ${this.state.score}`,
      this.canvas.width / 2,
      this.canvas.height / 2 + 10
    );

    const nextLevelId = this.levelManager.getNextLevelId();
    this.ctx.font = '18px Arial';
    if (nextLevelId) {
      this.ctx.fillText(
        'Press ENTER or N for Next Level',
        this.canvas.width / 2,
        this.canvas.height / 2 + 50
      );
    } else {
      this.ctx.fillText(
        'All Levels Complete!',
        this.canvas.width / 2,
        this.canvas.height / 2 + 50
      );
    }
  }

  private findLandedPlatform(): number {
    const playerBounds = this.player.getBounds();
    const playerBottom = playerBounds.y + playerBounds.height;
    const playerCenterX = playerBounds.x + playerBounds.width / 2;

    for (let i = 0; i < this.platforms.length; i++) {
      const platformBounds = this.platforms[i].getBounds();

      // Check if player is standing on this platform
      if (playerCenterX >= platformBounds.x &&
          playerCenterX <= platformBounds.x + platformBounds.width &&
          Math.abs(playerBottom - platformBounds.y) < 5) {
        return i;
      }
    }

    return -1;
  }

  private loseLife(): void {
    this.state.lives--;

    if (this.state.lives <= 0) {
      this.state.isGameOver = true;
    } else {
      // Reset player position to current level's spawn point
      const config = this.levelManager.getCurrentConfig();
      if (config) {
        this.player.reset(config.spawnPosition.x, config.spawnPosition.y);
      }
    }

    this.updateUI();
  }

  private onLevelComplete(): void {
    this.state.levelCompleted = true;
    this.state.isPaused = true;

    console.log('Level Complete!');
  }

  public nextLevel(): void {
    const nextLevelId = this.levelManager.getNextLevelId();

    if (nextLevelId) {
      this.loadLevel(nextLevelId);
      this.state.isPaused = false;
    } else {
      console.log('Game Complete! All levels finished.');
      // Show game complete state
      this.state.isGameOver = true;
    }
  }

  private updateUI(): void {
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');
    const levelElement = document.getElementById('level');

    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.state.score}`;
    }

    if (livesElement) {
      livesElement.textContent = `Lives: ${this.state.lives}`;
    }

    if (levelElement) {
      const config = this.levelManager.getCurrentConfig();
      levelElement.textContent = config ? `Level: ${config.name}` : '';
    }
  }

  private gameLoop = (timestamp: number): void => {
    // Calculate delta time in seconds
    const deltaTime = this.lastTime === 0 ? 0 : (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    // Cap delta time to prevent large jumps
    const cappedDeltaTime = Math.min(deltaTime, 0.1);

    // Handle pause toggle
    if (this.inputManager.isPausePressed()) {
      // Simple debouncing - you might want to improve this
      setTimeout(() => {
        if (!this.state.isGameOver && !this.state.levelCompleted) {
          this.state.isPaused = !this.state.isPaused;
        }
      }, 200);
    }

    // Handle next level
    if (this.state.levelCompleted && !this.state.isGameOver &&
        (this.inputManager.isKeyPressed('Enter') || this.inputManager.isKeyPressed('n'))) {
      this.nextLevel();
    }

    // Handle restart
    if (this.state.isGameOver && this.inputManager.isKeyPressed('r')) {
      this.restart();
    }

    this.update(cappedDeltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private restart(): void {
    this.state.score = 0;
    this.state.lives = 3;
    this.state.isGameOver = false;
    this.state.isPaused = false;

    // Reload starting level
    this.loadLevel(getStartingLevelId());
  }

  public start(): void {
    console.log('Starting game...');
    this.updateUI();
    this.animationId = requestAnimationFrame(this.gameLoop);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
