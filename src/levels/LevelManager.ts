import type { LevelConfig, PhysicsConfig, LevelFeatures } from './LevelConfig';
import type { GameState, Vector2D } from '../types';
import { Platform } from '../Platform';
import { getLevelConfig } from './level-configs/index';
import type { PhysicsSystem } from '../physics/PhysicsSystem';
import { JumpSystem } from '../physics/JumpSystem';
import { MovementSystem } from '../physics/MovementSystem';
import { ScreenWrappingSystem } from '../physics/ScreenWrappingSystem';
import { HorizontalAccelerationSystem } from '../physics/HorizontalAccelerationSystem';
import { VerticalAccelerationSystem } from '../physics/VerticalAccelerationSystem';
import { FallSlowdownSystem } from '../physics/FallSlowdownSystem';
import { FallAccelerationSystem } from '../physics/FallAccelerationSystem';
import { SpeedJumpBoostSystem } from '../physics/SpeedJumpBoostSystem';
import { BouncingJumpSystem } from '../physics/BouncingJumpSystem';

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
      new Platform(
        p.x,
        p.y,
        p.width,
        p.height,
        p.color ?? '#0f3460',
        p.isDynamic ?? false,
        p.visibleColor,
        p.invisibleColor
      )
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

  /**
   * Create physics systems based on level configuration
   * Returns array of physics systems to be run by the player
   */
  createPhysicsSystems(config: LevelConfig): PhysicsSystem[] {
    const systems: PhysicsSystem[] = [];
    const physics = config.physics;

    // Gravity system with fall slowdown/acceleration support
    let fallSlowdownSystem: FallSlowdownSystem | null = null;
    let fallAccelerationSystem: FallAccelerationSystem | null = null;
    let verticalAccelSystem: VerticalAccelerationSystem | null = null;

    // Vertical acceleration (Level 2)
    if (physics.verticalAccel?.enabled || physics.verticalAcceleration?.enabled) {
      const vertConfig = physics.verticalAccel || physics.verticalAcceleration!;
      verticalAccelSystem = new VerticalAccelerationSystem({
        increaseRate: vertConfig.increaseRate,
        maxMultiplier: vertConfig.maxMultiplier
      });
      systems.push(verticalAccelSystem);
    }

    // Fall slowdown (Level 2)
    if (physics.fallSlowdown?.enabled) {
      fallSlowdownSystem = new FallSlowdownSystem({
        slowdownPerEffect: physics.fallSlowdown.slowdownPerEffect,
        maxSlowdown: physics.fallSlowdown.maxSlowdown,
        effectDuration: physics.fallSlowdown.effectDuration
      });
      systems.push(fallSlowdownSystem);
    }

    // Fall acceleration (Level 2)
    if (physics.fallAcceleration?.enabled) {
      fallAccelerationSystem = new FallAccelerationSystem({
        boostPerEffect: physics.fallAcceleration.boostPerEffect,
        maxBoost: physics.fallAcceleration.maxBoost,
        effectDuration: physics.fallAcceleration.effectDuration
      });
      systems.push(fallAccelerationSystem);
    }

    // Wrap gravity system to apply vertical acceleration, fall slowdown, and fall acceleration
    const wrappedGravitySystem: PhysicsSystem = {
      update: (state, context) => {
        // Get multipliers from other systems
        const verticalMultiplier = verticalAccelSystem?.getMultiplier() ?? 1.0;
        const slowdownMultiplier = fallSlowdownSystem?.getSlowdownMultiplier() ?? 1.0;
        const accelerationMultiplier = fallAccelerationSystem?.getBoostMultiplier() ?? 1.0;

        // Apply gravity with all multipliers
        // Note: slowdown and acceleration work in opposite directions
        const effectiveGravity = physics.gravity * verticalMultiplier * slowdownMultiplier * accelerationMultiplier;
        state.velocity.y += effectiveGravity * context.deltaTime;

        // Cap fall speed
        if (state.velocity.y > physics.maxFallSpeed) {
          state.velocity.y = physics.maxFallSpeed;
        }

        return true;
      }
    };
    systems.push(wrappedGravitySystem);

    // Movement and jumping systems
    if (config.features.horizontalAcceleration &&
        (physics.horizontalAccel?.enabled !== false)) {
      // Level 1: Horizontal acceleration + speed-based jump boost
      const accelConfig = physics.horizontalAccel || {
        enabled: true,
        increaseRate: 0.1,
        maxMultiplier: 4.0
      };

      const accelSystem = new HorizontalAccelerationSystem({
        moveSpeed: physics.moveSpeed,
        increaseRate: accelConfig.increaseRate,
        maxMultiplier: accelConfig.maxMultiplier
      });
      systems.push(accelSystem);

      // Speed-based jump boost (depends on horizontal acceleration)
      const jumpBoostConfig = physics.speedJumpBoost || physics.speedBasedJumpBoost || {
        enabled: true,
        boostCoefficient: 0.6
      };

      if (jumpBoostConfig.enabled) {
        systems.push(new SpeedJumpBoostSystem(
          {
            jumpForce: physics.jumpForce,
            boostCoefficient: jumpBoostConfig.boostCoefficient
          },
          accelSystem
        ));
      } else {
        systems.push(new JumpSystem({ jumpForce: physics.jumpForce }));
      }
    } else {
      // Level 2 or others: Basic movement + jump system
      systems.push(new MovementSystem({ moveSpeed: physics.moveSpeed }));

      // Check for bouncing jump system (Level 3)
      if (physics.bouncingJump?.enabled) {
        systems.push(new BouncingJumpSystem({
          jumpForce: physics.jumpForce,
          boostPerBounce: physics.bouncingJump.boostPerBounce,
          maxBounces: physics.bouncingJump.maxBounces,
          timingWindow: physics.bouncingJump.timingWindow
        }));
      } else {
        systems.push(new JumpSystem({ jumpForce: physics.jumpForce }));
      }
    }

    // Screen wrapping (if enabled)
    if (config.features.screenWrapping || config.features.verticalScreenWrapping) {
      systems.push(new ScreenWrappingSystem({
        horizontal: config.features.screenWrapping,
        vertical: config.features.verticalScreenWrapping,
        playerWidth: 30,
        playerHeight: 40
      }));
    }

    return systems;
  }
}
