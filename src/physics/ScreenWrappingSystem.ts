import type { PhysicsSystem, PhysicsState, PhysicsContext } from './PhysicsSystem';

export interface ScreenWrappingConfig {
  horizontal: boolean;
  vertical: boolean;
  playerWidth: number;
  playerHeight: number;
}

/**
 * Handles screen wrapping (teleporting to opposite edge)
 * Can be configured for horizontal and/or vertical wrapping independently
 */
export class ScreenWrappingSystem implements PhysicsSystem {
  constructor(private config: ScreenWrappingConfig) {}

  update(state: PhysicsState, context: PhysicsContext): boolean {
    let wrapped = false;

    // Horizontal wrapping
    if (this.config.horizontal) {
      if (state.position.x + this.config.playerWidth < 0) {
        // Player completely left of screen - wrap to right
        state.position.x = context.canvasWidth;
        wrapped = true;
      } else if (state.position.x > context.canvasWidth) {
        // Player completely right of screen - wrap to left
        state.position.x = -this.config.playerWidth;
        wrapped = true;
      }
    }

    // Vertical wrapping
    if (this.config.vertical) {
      if (state.position.y + this.config.playerHeight < 0) {
        // Player completely above screen - wrap to bottom
        state.position.y = context.canvasHeight;
        wrapped = true;
      } else if (state.position.y > context.canvasHeight) {
        // Player completely below screen - wrap to top
        state.position.y = -this.config.playerHeight;
        wrapped = true;
      }
    }

    return wrapped;
  }
}
