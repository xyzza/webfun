import type { GameObject, Vector2D, Collidable } from './types';
import type { InputManager } from './InputManager';
import type { Platform } from './Platform';

export class Player implements GameObject, Collidable {
  position: Vector2D;
  velocity: Vector2D;
  width: number = 30;
  height: number = 40;
  color: string = '#e94560';

  private readonly gravity: number = 980; // pixels per second squared
  private readonly jumpForce: number = -450; // pixels per second
  private readonly moveSpeed: number = 250; // pixels per second
  private readonly maxFallSpeed: number = 600;

  private isGrounded: boolean = false;
  private canJump: boolean = true;

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  update(deltaTime: number, input: InputManager, platforms: Platform[], canvasWidth: number): void {
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Limit fall speed
    if (this.velocity.y > this.maxFallSpeed) {
      this.velocity.y = this.maxFallSpeed;
    }

    // Horizontal movement
    this.velocity.x = 0;
    if (input.isLeftPressed()) {
      this.velocity.x = -this.moveSpeed;
    }
    if (input.isRightPressed()) {
      this.velocity.x = this.moveSpeed;
    }

    // Jump
    if (input.isJumpPressed() && this.isGrounded && this.canJump) {
      this.velocity.y = this.jumpForce;
      this.canJump = false;
    }

    // Reset jump when key is released
    if (!input.isJumpPressed()) {
      this.canJump = true;
    }

    // Update position
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Check collisions with platforms
    this.isGrounded = false;
    for (const platform of platforms) {
      if (this.checkCollision(platform)) {
        this.resolveCollision(platform);
      }
    }

    // Horizontal screen wrapping: teleport to opposite edge when completely off-screen
    if (this.position.x + this.width < 0) {
      // Player completely left of screen - wrap to right
      this.position.x = canvasWidth;
    } else if (this.position.x > canvasWidth) {
      // Player completely right of screen - wrap to left
      this.position.x = -this.width;
    }
  }

  private resolveCollision(platform: Platform): void {
    const bounds = this.getBounds();
    const platformBounds = platform.getBounds();

    // Calculate overlap on each axis
    const overlapX = Math.min(
      bounds.x + bounds.width - platformBounds.x,
      platformBounds.x + platformBounds.width - bounds.x
    );
    const overlapY = Math.min(
      bounds.y + bounds.height - platformBounds.y,
      platformBounds.y + platformBounds.height - bounds.y
    );

    // Resolve collision on the axis with smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      if (bounds.x < platformBounds.x) {
        this.position.x = platformBounds.x - bounds.width;
      } else {
        this.position.x = platformBounds.x + platformBounds.width;
      }
      this.velocity.x = 0;
    } else {
      // Vertical collision
      if (bounds.y < platformBounds.y) {
        // Landing on top of platform
        this.position.y = platformBounds.y - bounds.height;
        this.velocity.y = 0;
        this.isGrounded = true;
      } else {
        // Hitting platform from below
        this.position.y = platformBounds.y + platformBounds.height;
        this.velocity.y = 0;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

    // Draw eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.position.x + 8, this.position.y + 10, 5, 5);
    ctx.fillRect(this.position.x + 17, this.position.y + 10, 5, 5);

    // Draw pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.position.x + 10, this.position.y + 12, 2, 2);
    ctx.fillRect(this.position.x + 19, this.position.y + 12, 2, 2);
  }

  checkCollision(other: Collidable): boolean {
    const bounds = this.getBounds();
    const otherBounds = other.getBounds();
    return (
      bounds.x < otherBounds.x + otherBounds.width &&
      bounds.x + bounds.width > otherBounds.x &&
      bounds.y < otherBounds.y + otherBounds.height &&
      bounds.y + bounds.height > otherBounds.y
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

  reset(x: number, y: number): void {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;
  }
}
