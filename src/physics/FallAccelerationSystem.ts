import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface FallAccelerationConfig {
  boostPerEffect: number;      // 0.05 = 5% boost per effect
  maxBoost: number;             // 1.0 = 100% max boost (2x gravity)
  effectDuration: number;       // 300ms per effect
}

/**
 * Allows player to accelerate fall speed by pressing down while falling
 * Effects stack additively and expire after duration
 * Used by Level 2
 */
export class FallAccelerationSystem implements PhysicsSystem {
  private effects: number[] = [];

  constructor(private config: FallAccelerationConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    const currentTime = Date.now();

    // Remove expired effects
    this.effects = this.effects.filter(
      timestamp => currentTime - timestamp < this.config.effectDuration
    );

    // Add new effect if pressing down while falling
    if (context.input.isDownPressed() && state.velocity.y > 0) {
      const currentBoost = this.effects.length * this.config.boostPerEffect;
      if (currentBoost < this.config.maxBoost) {
        this.effects.push(currentTime);
      }
    }

    return this.effects.length > 0;
  }

  /**
   * Get acceleration multiplier to apply to gravity
   * Returns value from 1.0 (no boost) to 2.0 (max boost with 100% config)
   */
  getBoostMultiplier(): number {
    const totalBoost = Math.min(
      this.effects.length * this.config.boostPerEffect,
      this.config.maxBoost
    );
    return 1.0 + totalBoost;
  }

  reset(): void {
    this.effects = [];
  }
}
