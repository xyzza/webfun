import type { InputManager } from '../InputManager';
import type { Platform } from '../Platform';
import type { Vector2D } from '../types';

/**
 * Physics state shared across all physics systems
 */
export interface PhysicsState {
  position: Vector2D;
  velocity: Vector2D;
  isGrounded: boolean;
  canJump: boolean;
}

/**
 * Context information needed by physics systems
 */
export interface PhysicsContext {
  deltaTime: number;
  input: InputManager;
  platforms: Platform[];
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Base interface for all physics systems
 * Each system implements specific physics behavior (gravity, jumping, movement, etc.)
 */
export interface PhysicsSystem {
  /**
   * Update physics state
   * @param state - Current physics state (can be modified)
   * @param context - Context information for this frame
   * @returns true if state was modified, false otherwise
   */
  update(state: PhysicsState, context: PhysicsContext): boolean;

  /**
   * Reset system state (called on player reset)
   * Optional - implement if system has internal state
   */
  reset?(): void;

  /**
   * Called when player collides with platform
   * Optional - implement if system needs collision events
   * @param platform - The platform involved in collision
   * @param direction - Collision direction
   */
  onCollision?(platform: Platform, direction: 'top' | 'bottom' | 'left' | 'right'): void;
}
