import type { Vector2D } from '../types';

/**
 * Platform definition in level configuration
 */
export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

/**
 * Base physics configuration (shared across all levels)
 */
export interface BasePhysicsConfig {
  gravity: number;
  jumpForce: number;
  moveSpeed: number;
  maxFallSpeed: number;
}

/**
 * Horizontal acceleration configuration (Level 1)
 */
export interface HorizontalAccelConfig {
  enabled: boolean;
  increaseRate: number;
  maxMultiplier: number;
}

/**
 * Vertical acceleration configuration (Level 2)
 */
export interface VerticalAccelConfig {
  enabled: boolean;
  increaseRate: number;
  maxMultiplier: number;
}

/**
 * Fall slowdown configuration (Level 2)
 */
export interface FallSlowdownConfig {
  enabled: boolean;
  slowdownPerEffect: number;
  maxSlowdown: number;
  effectDuration: number;
}

/**
 * Fall acceleration configuration (Level 2)
 */
export interface FallAccelerationConfig {
  enabled: boolean;
  boostPerEffect: number;
  maxBoost: number;
  effectDuration: number;
}

/**
 * Speed-based jump boost configuration (Level 1)
 */
export interface SpeedJumpBoostConfig {
  enabled: boolean;
  boostCoefficient: number;
}

/**
 * Physics configuration per level
 * Combines base physics with optional level-specific systems
 */
export interface PhysicsConfig extends BasePhysicsConfig {
  // Optional level-specific systems
  horizontalAccel?: HorizontalAccelConfig;
  verticalAccel?: VerticalAccelConfig;
  fallSlowdown?: FallSlowdownConfig;
  fallAcceleration?: FallAccelerationConfig;
  speedJumpBoost?: SpeedJumpBoostConfig;

  // Legacy support (deprecated - use new configs above)
  verticalAcceleration?: VerticalAccelConfig;
  speedBasedJumpBoost?: SpeedJumpBoostConfig;
}

/**
 * Feature flags per level
 */
export interface LevelFeatures {
  horizontalAcceleration: boolean;
  screenWrapping: boolean;
  verticalScreenWrapping: boolean;
  verticalAcceleration: boolean;
  resetOnNonGoalPlatform: boolean;
}

/**
 * Win condition for level completion
 */
export interface WinCondition {
  type: 'score' | 'time' | 'reach_platform';
  target?: number;
  platformIndex?: number;
}

/**
 * Complete level configuration
 */
export interface LevelConfig {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  spawnPosition: Vector2D;
  initialLives: number;
  platforms: PlatformConfig[];
  physics: PhysicsConfig;
  features: LevelFeatures;
  winCondition: WinCondition;
  nextLevelId?: string | null;
}

/**
 * Level registry - maps level IDs to configs
 */
export interface LevelRegistry {
  [levelId: string]: LevelConfig;
}
