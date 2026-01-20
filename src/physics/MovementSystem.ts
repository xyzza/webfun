import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface MovementConfig {
  moveSpeed: number;
}

/**
 * Basic constant-speed horizontal movement
 * Used when horizontal acceleration is disabled (e.g., Level 2)
 */
export class MovementSystem implements PhysicsSystem {
  constructor(private config: MovementConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    let currentDirection = 0;

    if (context.input.isLeftPressed() && !context.input.isRightPressed()) {
      currentDirection = -1;
    } else if (context.input.isRightPressed() && !context.input.isLeftPressed()) {
      currentDirection = 1;
    }

    state.velocity.x = currentDirection * this.config.moveSpeed;
    return true;
  }
}
