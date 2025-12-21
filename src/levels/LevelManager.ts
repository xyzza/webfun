import type { LevelConfig, PhysicsConfig, LevelFeatures } from './LevelConfig';
import type { GameState, Vector2D } from '../types';
import { Platform } from '../Platform';
import { getLevelConfig } from './level-configs/index';

export class LevelManager {
  private currentConfig: LevelConfig | null = null;

  /**
   * Load a level by ID
   */
  loadLevel(levelId: string): LevelConfig {
    const config = getLevelConfig(levelId);
    this.currentConfig = config;
    return config;
  }

  /**
   * Create platform instances from config
   */
  createPlatforms(config: LevelConfig): Platform[] {
    return config.platforms.map(p =>
      new Platform(p.x, p.y, p.width, p.height, p.color ?? '#0f3460')
    );
  }

  /**
   * Get player configuration for current level
   */
  getPlayerConfig(): { physics: PhysicsConfig; features: LevelFeatures; spawnPosition: Vector2D } {
    if (!this.currentConfig) {
      throw new Error('No level loaded');
    }
    return {
      physics: this.currentConfig.physics,
      features: this.currentConfig.features,
      spawnPosition: this.currentConfig.spawnPosition,
    };
  }

  /**
   * Check if win condition is met
   */
  checkWinCondition(state: GameState, platforms: Platform[], playerPos: Vector2D): boolean {
    const condition = this.currentConfig?.winCondition;
    if (!condition) return false;

    switch (condition.type) {
      case 'score':
        return state.score >= (condition.target ?? 0);
      case 'time':
        return (Date.now() - state.levelStartTime) >= (condition.target ?? 0);
      case 'reach_platform': {
        // Check if player is on target platform
        const targetPlatform = platforms[condition.platformIndex ?? -1];
        if (!targetPlatform) return false;

        const bounds = targetPlatform.getBounds();
        return (
          playerPos.x >= bounds.x &&
          playerPos.x <= bounds.x + bounds.width &&
          playerPos.y >= bounds.y - 50 &&
          playerPos.y <= bounds.y + 10
        );
      }
      default:
        return false;
    }
  }

  /**
   * Get next level ID
   */
  getNextLevelId(): string | null {
    return this.currentConfig?.nextLevelId ?? null;
  }

  /**
   * Get current level configuration
   */
  getCurrentConfig(): LevelConfig | null {
    return this.currentConfig;
  }
}
