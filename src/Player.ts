import type { GameObject, Vector2D, Collidable } from './types';
import type { InputManager } from './InputManager';
import type { Platform } from './Platform';
import type { PhysicsConfig, LevelFeatures } from './levels/LevelConfig';

export class Player implements GameObject, Collidable {
  position: Vector2D;
  velocity: Vector2D;
  width: number = 30;
  height: number = 40;
  color: string = '#e94560';

  // Configurable physics parameters (defaults)
  private gravity: number = 980;
  private jumpForce: number = -450;
  private moveSpeed: number = 250;
  private maxFallSpeed: number = 600;

  private isGrounded: boolean = false;
  private canJump: boolean = true;

  // Horizontal acceleration system
  private currentSpeedMultiplier: number = 1.0;
  private lastDirection: number = 0; // -1 (left), 0 (none), 1 (right)
  private readonly speedIncreaseRate: number = 0.05; // 5% per second
  private readonly maxSpeedMultiplier: number = 4.0; // Cap at 400% speed

  // Vertical acceleration system (NEW)
  private verticalSpeedMultiplier: number = 1.0;
  private lastVerticalDirection: number = 0; // -1 (up), 0 (none), 1 (down)
  private verticalAccelConfig?: {
    enabled: boolean;
    increaseRate: number;
    maxMultiplier: number;
  };

  // Fall speed control system
  private fallSlowdownEffects: number[] = []; // Array of effect timestamps
  private readonly slowdownPerEffect: number = 0.05; // 5% per effect
  private readonly maxSlowdown: number = 0.5; // Max 50%
  private readonly effectDuration: number = 300; // 300ms per effect

  // Feature flags
  private features: LevelFeatures = {
    horizontalAcceleration: true,
    screenWrapping: true,
    verticalScreenWrapping: false,
    verticalAcceleration: false,
    resetOnNonGoalPlatform: false,
  }

  constructor(x: number, y: number) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Configure player physics and features for current level
   */
  configure(physics: PhysicsConfig, features: LevelFeatures): void {
    this.gravity = physics.gravity;
    this.jumpForce = physics.jumpForce;
    this.moveSpeed = physics.moveSpeed;
    this.maxFallSpeed = physics.maxFallSpeed;
    this.features = features;

    if (physics.verticalAcceleration) {
      this.verticalAccelConfig = physics.verticalAcceleration;
    }
  }

  update(deltaTime: number, input: InputManager, platforms: Platform[], canvasWidth: number, canvasHeight: number): void {
    // Vertical acceleration logic (if enabled)
    if (this.features.verticalAcceleration && this.verticalAccelConfig?.enabled) {
      const currentVerticalDir = this.velocity.y > 0 ? 1 : this.velocity.y < 0 ? -1 : 0;

      if (currentVerticalDir === 0 || currentVerticalDir !== this.lastVerticalDirection) {
        // At apex or direction changed - reset multiplier
        this.verticalSpeedMultiplier = 1.0;
      } else {
        // Accelerating in same direction
        this.verticalSpeedMultiplier = Math.min(
          this.verticalSpeedMultiplier + this.verticalAccelConfig.increaseRate * deltaTime,
          this.verticalAccelConfig.maxMultiplier
        );
      }

      this.lastVerticalDirection = currentVerticalDir;
    } else {
      this.verticalSpeedMultiplier = 1.0;
    }

    // Fall speed control (if vertical acceleration enabled)
    let fallSlowdownMultiplier = 1.0;
    if (this.features.verticalAcceleration && this.verticalAccelConfig?.enabled) {
      const currentTime = Date.now();

      // Remove expired effects (older than 300ms)
      this.fallSlowdownEffects = this.fallSlowdownEffects.filter(
        timestamp => currentTime - timestamp < this.effectDuration
      );

      // Add new effect if player presses up while falling
      if (input.isJumpPressed() && this.velocity.y > 0) {
        const currentSlowdown = this.fallSlowdownEffects.length * this.slowdownPerEffect;
        if (currentSlowdown < this.maxSlowdown) {
          this.fallSlowdownEffects.push(currentTime);
        }
      }

      // Calculate total slowdown
      const totalSlowdown = Math.min(
        this.fallSlowdownEffects.length * this.slowdownPerEffect,
        this.maxSlowdown
      );
      fallSlowdownMultiplier = 1.0 - totalSlowdown;
    }

    // Apply gravity with vertical multiplier and fall slowdown
    const effectiveGravity = this.gravity * this.verticalSpeedMultiplier * fallSlowdownMultiplier;
    this.velocity.y += effectiveGravity * deltaTime;

    // Limit fall speed
    if (this.velocity.y > this.maxFallSpeed) {
      this.velocity.y = this.maxFallSpeed;
    }

    // Horizontal movement
    let currentDirection = 0;
    if (input.isLeftPressed() && !input.isRightPressed()) {
      currentDirection = -1;
    } else if (input.isRightPressed() && !input.isLeftPressed()) {
      currentDirection = 1;
    }

    // Horizontal acceleration (if enabled)
    if (this.features.horizontalAcceleration) {
      // Speed multiplier logic
      if (currentDirection === 0) {
        // Not moving - reset multiplier
        this.currentSpeedMultiplier = 1.0;
      } else if (currentDirection !== this.lastDirection) {
        // Direction changed - reset multiplier
        this.currentSpeedMultiplier = 1.0;
      } else {
        // Moving in same direction - increase multiplier
        this.currentSpeedMultiplier = Math.min(
          this.currentSpeedMultiplier + this.speedIncreaseRate * deltaTime,
          this.maxSpeedMultiplier
        );
      }

      this.velocity.x = currentDirection * this.moveSpeed * this.currentSpeedMultiplier;
      this.lastDirection = currentDirection;
    } else {
      // Constant speed (no acceleration)
      this.velocity.x = currentDirection * this.moveSpeed;
      this.currentSpeedMultiplier = 1.0;
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

    // Screen boundary handling
    if (this.features.screenWrapping) {
      // Horizontal screen wrapping: teleport to opposite edge
      if (this.position.x + this.width < 0) {
        // Player completely left of screen - wrap to right
        this.position.x = canvasWidth;
      } else if (this.position.x > canvasWidth) {
        // Player completely right of screen - wrap to left
        this.position.x = -this.width;
      }
    } else {
      // Clamp to screen bounds
      if (this.position.x < 0) {
        this.position.x = 0;
      }
      if (this.position.x + this.width > canvasWidth) {
        this.position.x = canvasWidth - this.width;
      }
    }

    // Vertical screen wrapping
    if (this.features.verticalScreenWrapping) {
      if (this.position.y + this.height < 0) {
        // Player completely above screen - wrap to bottom
        this.position.y = canvasHeight;
      } else if (this.position.y > canvasHeight) {
        // Player completely below screen - wrap to top
        this.position.y = -this.height;
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
      // Reset vertical acceleration on vertical collision
      this.verticalSpeedMultiplier = 1.0;
      this.lastVerticalDirection = 0;
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
    // Reset horizontal acceleration state
    this.currentSpeedMultiplier = 1.0;
    this.lastDirection = 0;
    // Reset vertical acceleration state
    this.verticalSpeedMultiplier = 1.0;
    this.lastVerticalDirection = 0;
    // Reset fall slowdown effects
    this.fallSlowdownEffects = [];
  }
}
