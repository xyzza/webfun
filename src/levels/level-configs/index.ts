import type { LevelConfig, LevelRegistry } from '../LevelConfig';

// Import JSON files
import level01 from './level-01.json';
import level02 from './level-02.json';

/**
 * Central registry of all levels
 */
export const LEVEL_REGISTRY: LevelRegistry = {
  'level-01': level01 as LevelConfig,
  'level-02': level02 as LevelConfig,
};

/**
 * Get level by ID with validation
 */
export function getLevelConfig(levelId: string): LevelConfig {
  const config = LEVEL_REGISTRY[levelId];
  if (!config) {
    throw new Error(`Level "${levelId}" not found in registry`);
  }
  return config;
}

/**
 * Get starting level ID
 */
export function getStartingLevelId(): string {
  return 'level-02';
}

/**
 * Get all level IDs in order
 */
export function getAllLevelIds(): string[] {
  return Object.keys(LEVEL_REGISTRY);
}
