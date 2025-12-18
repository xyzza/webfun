import { Player } from './Player';
import { Platform } from './Platform';
import { InputManager } from './InputManager';
import type { GameState } from './types';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private platforms: Platform[] = [];
  private inputManager: InputManager;
  private lastTime: number = 0;
  private animationId: number = 0;

  private state: GameState = {
    score: 0,
    lives: 3,
    isGameOver: false,
    isPaused: false,
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

    this.initializePlatforms();
  }

  private initializePlatforms(): void {
    // Ground
    this.platforms.push(new Platform(0, 560, 800, 40, '#0f3460'));

    // Platforms
    this.platforms.push(new Platform(150, 450, 150, 20, '#0f3460'));
    this.platforms.push(new Platform(400, 350, 150, 20, '#0f3460'));
    this.platforms.push(new Platform(200, 250, 150, 20, '#0f3460'));
    this.platforms.push(new Platform(500, 200, 120, 20, '#0f3460'));
    this.platforms.push(new Platform(650, 450, 100, 20, '#0f3460'));
  }

  private update(deltaTime: number): void {
    if (this.state.isGameOver || this.state.isPaused) {
      return;
    }

    // Update player
    this.player.update(deltaTime, this.inputManager, this.platforms);

    // Check if player fell off the screen
    if (this.player.position.y > this.canvas.height) {
      this.loseLife();
    }

    // Update score (simple time-based scoring)
    this.state.score += Math.floor(deltaTime * 10);
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

    // Render pause screen
    if (this.state.isPaused) {
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

  private loseLife(): void {
    this.state.lives--;

    if (this.state.lives <= 0) {
      this.state.isGameOver = true;
    } else {
      // Reset player position
      this.player.reset(100, 100);
    }

    this.updateUI();
  }

  private updateUI(): void {
    const scoreElement = document.getElementById('score');
    const livesElement = document.getElementById('lives');

    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.state.score}`;
    }

    if (livesElement) {
      livesElement.textContent = `Lives: ${this.state.lives}`;
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
        if (!this.state.isGameOver) {
          this.state.isPaused = !this.state.isPaused;
        }
      }, 200);
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
    this.state = {
      score: 0,
      lives: 3,
      isGameOver: false,
      isPaused: false,
    };
    this.player.reset(100, 100);
    this.updateUI();
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
