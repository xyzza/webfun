import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface GravityConfig {
  gravity: number;
  maxFallSpeed: number;
}

/**
 * Applies gravity acceleration and caps maximum fall speed
 * Used by all levels
 */
export class GravitySystem implements PhysicsSystem {
  constructor(private config: GravityConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    // Apply gravity
    state.velocity.y += this.config.gravity * context.deltaTime;

    // Cap fall speed
    if (state.velocity.y > this.config.maxFallSpeed) {
      state.velocity.y = this.config.maxFallSpeed;
    }

    return true;
  }
}
