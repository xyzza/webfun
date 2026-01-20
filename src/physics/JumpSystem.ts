import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface JumpConfig {
  jumpForce: number;
}

/**
 * Basic jump system without any speed-based modifications
 * Used when horizontal acceleration is disabled
 */
export class JumpSystem implements PhysicsSystem {
  private canJump: boolean = true;

  constructor(private config: JumpConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    // Reset jump when key released
    if (!context.input.isJumpPressed()) {
      this.canJump = true;
      return false;
    }

    // Jump
    if (context.input.isJumpPressed() && state.isGrounded && this.canJump) {
      state.velocity.y = this.config.jumpForce;
      this.canJump = false;
      return true;
    }

    return false;
  }

  reset(): void {
    this.canJump = true;
  }
}
