import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';
import type { Platform } from '../Platform';

export interface VerticalAccelerationConfig {
  increaseRate: number;
  maxMultiplier: number;
}

/**
 * Vertical acceleration system that increases gravity when moving in same vertical direction
 * Multiplier resets at apex or direction change
 * Used by Level 2
 */
export class VerticalAccelerationSystem implements PhysicsSystem {
  private multiplier: number = 1.0;
  private lastDirection: number = 0;

  constructor(private config: VerticalAccelerationConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    const currentDirection = state.velocity.y > 0 ? 1 : state.velocity.y < 0 ? -1 : 0;

    // Reset at apex or direction change
    if (currentDirection === 0 || currentDirection !== this.lastDirection) {
      this.multiplier = 1.0;
    } else {
      // Accelerate in same direction
      this.multiplier = Math.min(
        this.multiplier + this.config.increaseRate * context.deltaTime,
        this.config.maxMultiplier
      );
    }

    this.lastDirection = currentDirection;

    return true;
  }

  /**
   * Get current multiplier for use by gravity calculation
   */
  getMultiplier(): number {
    return this.multiplier;
  }

  reset(): void {
    this.multiplier = 1.0;
    this.lastDirection = 0;
  }

  onCollision(_platform: Platform, direction: 'top' | 'bottom' | 'left' | 'right'): void {
    // Reset on vertical collision
    if (direction === 'top' || direction === 'bottom') {
      this.multiplier = 1.0;
      this.lastDirection = 0;
    }
  }
}
