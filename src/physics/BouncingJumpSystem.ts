import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';
import type { Platform } from '../Platform';

export interface BouncingJumpConfig {
  jumpForce: number;
  boostPerBounce: number;   // Boost percentage per bounce (e.g., 0.04 for 4%)
  maxBounces: number;        // Maximum consecutive bounces (e.g., 5)
  timingWindow: number;      // Time window after landing to jump (in seconds, e.g., 0.3)
}

/**
 * Bouncing jump system that increases jump height with rhythmic jumps in place
 * Jump height increases by boostPerBounce for each bounce (up to maxBounces)
 * Player must jump within timingWindow after landing to maintain combo
 * Resets when player moves horizontally or jumps too late after landing
 * Used by Level 3
 */
export class BouncingJumpSystem implements PhysicsSystem {
  private canJump: boolean = true;
  private bounceCount: number = 0;
  private wasGroundedLastFrame: boolean = false;
  private timeSinceGrounded: number = 0;

  constructor(private config: BouncingJumpConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    const isJumpPressed = context.input.isJumpPressed();
    const isMovingHorizontally = context.input.isLeftPressed() || context.input.isRightPressed();

    // Reset bounce count if player moves horizontally
    if (isMovingHorizontally) {
      this.bounceCount = 0;
    }

    // Reset jump when key released
    if (!isJumpPressed) {
      this.canJump = true;
      return false;
    }

    // Detect landing (transition from not grounded to grounded)
    if (state.isGrounded && !this.wasGroundedLastFrame) {
      // Reset timer on landing
      this.timeSinceGrounded = 0;
    }

    // Update timer while grounded
    if (state.isGrounded) {
      this.timeSinceGrounded += context.deltaTime;

      // Reset bounce count if player waits too long after landing
      if (this.timeSinceGrounded > this.config.timingWindow) {
        this.bounceCount = 0;
      }
    }

    this.wasGroundedLastFrame = state.isGrounded;

    // Execute jump with bounce boost
    if (isJumpPressed && state.isGrounded && this.canJump) {
      // Check if jump is within timing window
      const isTimedJump = this.timeSinceGrounded <= this.config.timingWindow;

      // Update bounce count based on timing
      if (isTimedJump && !isMovingHorizontally) {
        // Good timing - increment bounce count
        this.bounceCount = Math.min(this.bounceCount + 1, this.config.maxBounces);
      } else {
        // Bad timing or moving - reset
        this.bounceCount = 0;
      }

      // Calculate jump multiplier based on bounce count
      const boostMultiplier = 1.0 + (this.config.boostPerBounce * this.bounceCount);

      // Apply boosted jump force
      state.velocity.y = this.config.jumpForce * boostMultiplier;
      this.canJump = false;
      return true;
    }

    return false;
  }

  reset(): void {
    this.canJump = true;
    this.bounceCount = 0;
    this.wasGroundedLastFrame = false;
    this.timeSinceGrounded = 0;
  }

  onCollision(_platform: Platform, direction: 'top' | 'bottom' | 'left' | 'right'): void {
    // Reset on hitting ceiling
    if (direction === 'bottom') {
      this.bounceCount = 0;
    }
  }

  /**
   * Get current bounce count for debugging/UI
   */
  getBounceCount(): number {
    return this.bounceCount;
  }
}
