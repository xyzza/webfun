import type { GameObject, Vector2D, Collidable } from './types';

export class Platform implements GameObject, Collidable {
  position: Vector2D;
  velocity: Vector2D = { x: 0, y: 0 };
  width: number;
  height: number;
  color: string;

  constructor(x: number, y: number, width: number, height: number, color: string = '#0f3460') {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.color = color;
  }

  update(_deltaTime: number): void {
    // Platforms are static for now
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Add a subtle border
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
  }

  checkCollision(other: Collidable): boolean {
    const otherBounds = other.getBounds();
    return (
      this.position.x < otherBounds.x + otherBounds.width &&
      this.position.x + this.width > otherBounds.x &&
      this.position.y < otherBounds.y + otherBounds.height &&
      this.position.y + this.height > otherBounds.y
    );
  }

  getBounds() {
    return {
      x: this.position.x,
      y: this.position.y,
      width: this.width,
      height: this.height,
    };
  }
}
