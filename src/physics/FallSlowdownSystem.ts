import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface FallSlowdownConfig {
  slowdownPerEffect: number;  // 0.05 = 5% per effect
  maxSlowdown: number;         // 0.5 = 50% max
  effectDuration: number;      // 300ms per effect
}

/**
 * Allows player to slow fall speed by pressing jump while falling
 * Effects stack additively and expire after duration
 * Used by Level 2
 */
export class FallSlowdownSystem implements PhysicsSystem {
  private effects: number[] = [];

  constructor(private config: FallSlowdownConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    const currentTime = Date.now();

    // Remove expired effects
    this.effects = this.effects.filter(
      timestamp => currentTime - timestamp < this.config.effectDuration
    );

    // Add new effect if pressing jump while falling
    if (context.input.isJumpPressed() && state.velocity.y > 0) {
      const currentSlowdown = this.effects.length * this.config.slowdownPerEffect;
      if (currentSlowdown < this.config.maxSlowdown) {
        this.effects.push(currentTime);
      }
    }

    return this.effects.length > 0;
  }

  /**
   * Get slowdown multiplier to apply to gravity
   * Returns value from 0.5 (max slowdown) to 1.0 (no slowdown)
   */
  getSlowdownMultiplier(): number {
    const totalSlowdown = Math.min(
      this.effects.length * this.config.slowdownPerEffect,
      this.config.maxSlowdown
    );
    return 1.0 - totalSlowdown;
  }

  reset(): void {
    this.effects = [];
  }
}
