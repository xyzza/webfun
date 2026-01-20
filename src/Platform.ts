import type { GameObject, Vector2D, Collidable } from './types';

export class Platform implements GameObject, Collidable {
  position: Vector2D;
  velocity: Vector2D = { x: 0, y: 0 };
  width: number;
  height: number;
  color: string;

  // Dynamic visibility properties
  isDynamic: boolean = false;
  visibleColor: string = '#0f3460';    // Standard platform blue
  invisibleColor: string = '#16213e';  // Canvas background color
  showBorder: boolean = true;          // Border visibility flag

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string = '#0f3460',
    isDynamic: boolean = false,
    visibleColor?: string,
    invisibleColor?: string
  ) {
    this.position = { x, y };
    this.width = width;
    this.height = height;
    this.isDynamic = isDynamic;

    // Set colors
    if (visibleColor) this.visibleColor = visibleColor;
    if (invisibleColor) this.invisibleColor = invisibleColor;

    // For dynamic platforms, start invisible
    if (isDynamic) {
      this.color = this.invisibleColor;
      this.showBorder = false;
    } else {
      this.color = color;
    }
  }

  update(_deltaTime: number, isPlayerStanding: boolean = false): void {
    if (!this.isDynamic) return;

    // Update visibility based on player presence
    this.color = isPlayerStanding ? this.visibleColor : this.invisibleColor;
    this.showBorder = isPlayerStanding;
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Only draw border if showBorder is true
    if (this.showBorder) {
      ctx.strokeStyle = '#e94560';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }
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
