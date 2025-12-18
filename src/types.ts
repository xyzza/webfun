export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  position: Vector2D;
  velocity: Vector2D;
  width: number;
  height: number;
  update(deltaTime: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface Collidable {
  checkCollision(other: Collidable): boolean;
  getBounds(): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface GameState {
  score: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
}
