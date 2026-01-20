import type { GameObject, Vector2D, Collidable } from './types';
import type { InputManager } from './InputManager';
import type { Platform } from './Platform';
import type { LevelFeatures } from './levels/LevelConfig';
import type { PhysicsSystem, PhysicsState } from './physics/PhysicsSystem';

export class Player implements GameObject, Collidable {
  position: Vector2D;
  velocity: Vector2D;
  width: number = 30;
  height: number = 40;
  color: string = '#e94560';

  private isGrounded: boolean = false;
  private physicsSystems: PhysicsSystem[] = [];
  private features: LevelFeatures = {
    horizontalAcceleration: true,
    screenWrapping: true,
    verticalScreenWrapping: false,
    verticalAcceleration: false,
    resetOnNonGoalPlatform: false,
  };

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Configure player physics systems and features for current level
   */
  configure(systems: PhysicsSystem[], features: LevelFeatures): void {
    this.physicsSystems = systems;
    this.features = features;
  }

  update(deltaTime: number, input: InputManager, platforms: Platform[], canvasWidth: number, canvasHeight: number): void {
    // Create physics state
    const state: PhysicsState = {
      position: this.position,
      velocity: this.velocity,
      isGrounded: this.isGrounded,
      canJump: true // Systems will manage this internally
    };

    const context = {
      deltaTime,
      input,
      platforms,
      canvasWidth,
      canvasHeight
    };

    // Run all physics systems
    for (const system of this.physicsSystems) {
      system.update(state, context);
    }

    // Update position from velocity
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    // Check collisions with platforms
    this.isGrounded = false;
    for (const platform of platforms) {
      if (this.checkCollision(platform)) {
        this.resolveCollision(platform);
      }
    }

    // Screen boundary clamping (if wrapping not enabled)
    if (!this.features.screenWrapping) {
      if (this.position.x < 0) {
        this.position.x = 0;
      }
      if (this.position.x + this.width > canvasWidth) {
        this.position.x = canvasWidth - this.width;
      }
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

      // Notify systems about horizontal collision
      const direction = bounds.x < platformBounds.x ? 'left' : 'right';
      for (const system of this.physicsSystems) {
        system.onCollision?.(platform, direction);
      }
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

      // Notify systems about vertical collision
      const direction = bounds.y < platformBounds.y ? 'top' : 'bottom';
      for (const system of this.physicsSystems) {
        system.onCollision?.(platform, direction);
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

  getIsGrounded(): boolean {
    return this.isGrounded;
  }

  reset(x: number, y: number): void {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.isGrounded = false;

    // Reset all physics systems
    for (const system of this.physicsSystems) {
      system.reset?.();
    }
  }
}
