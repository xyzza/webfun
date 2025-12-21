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
 * Physics configuration per level
 */
export interface PhysicsConfig {
  gravity: number;
  jumpForce: number;
  moveSpeed: number;
  maxFallSpeed: number;
  verticalAcceleration?: {
    enabled: boolean;
    increaseRate: number;
    maxMultiplier: number;
  };
}

/**
 * Feature flags per level
 */
export interface LevelFeatures {
  horizontalAcceleration: boolean;
  screenWrapping: boolean;
  verticalAcceleration: boolean;
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
