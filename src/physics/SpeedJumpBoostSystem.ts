import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';
import type { HorizontalAccelerationSystem } from './HorizontalAccelerationSystem';

export interface SpeedJumpBoostConfig {
  jumpForce: number;
  boostCoefficient: number;
}

/**
 * Jump system with logarithmic speed-based height boost
 * Jump height increases based on horizontal speed multiplier
 * Depends on HorizontalAccelerationSystem for speed data
 * Used by Level 1
 */
export class SpeedJumpBoostSystem implements PhysicsSystem {
  private canJump: boolean = true;

  constructor(
    private config: SpeedJumpBoostConfig,
    private accelSystem: HorizontalAccelerationSystem
  ) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    // Reset jump when key released
    if (!context.input.isJumpPressed()) {
      this.canJump = true;
      return false;
    }

    // Jump with speed boost
    if (context.input.isJumpPressed() && state.isGrounded && this.canJump) {
      const speedMultiplier = this.accelSystem.getCurrentMultiplier();
      const maxMultiplier = this.accelSystem.getMaxMultiplier();

      // Normalize speed from 0.0 (stopped) to 1.0 (max speed)
      const normalizedSpeed = (speedMultiplier - 1.0) / (maxMultiplier - 1.0);

      // Logarithmic boost: 1.0x (stopped) to ~1.6x (max speed)
      const coefficient = this.config.boostCoefficient;
      const jumpMultiplier = 1.0 + coefficient * Math.log(1 + normalizedSpeed);

      // Apply boosted jump force
      state.velocity.y = this.config.jumpForce * jumpMultiplier;
      this.canJump = false;
      return true;
    }

    return false;
  }

  reset(): void {
    this.canJump = true;
  }
}
