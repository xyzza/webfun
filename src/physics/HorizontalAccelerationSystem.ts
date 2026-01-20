import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface HorizontalAccelerationConfig {
  moveSpeed: number;
  increaseRate: number;
  maxMultiplier: number;
}

/**
 * Horizontal movement with acceleration over time
 * Speed increases when moving in same direction, resets on stop or direction change
 * Used by Level 1
 */
export class HorizontalAccelerationSystem implements PhysicsSystem {
  private currentMultiplier: number = 1.0;
  private lastDirection: number = 0;

  constructor(private config: HorizontalAccelerationConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    let currentDirection = 0;

    if (context.input.isLeftPressed() && !context.input.isRightPressed()) {
      currentDirection = -1;
    } else if (context.input.isRightPressed() && !context.input.isLeftPressed()) {
      currentDirection = 1;
    }

    // Reset multiplier when stopped or direction changes
    if (currentDirection === 0) {
      this.currentMultiplier = 1.0;
    } else if (currentDirection !== this.lastDirection) {
      this.currentMultiplier = 1.0;
    } else {
      // Accelerate in same direction
      this.currentMultiplier = Math.min(
        this.currentMultiplier + this.config.increaseRate * context.deltaTime,
        this.config.maxMultiplier
      );
    }

    state.velocity.x = currentDirection * this.config.moveSpeed * this.currentMultiplier;
    this.lastDirection = currentDirection;

    return true;
  }

  reset(): void {
    this.currentMultiplier = 1.0;
    this.lastDirection = 0;
  }

  /**
   * Get current speed multiplier for use by other systems (e.g., SpeedJumpBoostSystem)
   */
  getCurrentMultiplier(): number {
    return this.currentMultiplier;
  }

  /**
   * Get maximum speed multiplier from config
   */
  getMaxMultiplier(): number {
    return this.config.maxMultiplier;
  }
}
