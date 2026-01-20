/// <reference types="vite/client" />

/**
 * Application configuration
 */

export interface AppConfig {
  debug: boolean;
  defaultLevelId: string;
}

/**
 * Development configuration (local development)
 */
const devConfig: AppConfig = {
  debug: true,
  defaultLevelId: 'level-01'
};

/**
 * Production configuration
 */
const prodConfig: AppConfig = {
  debug: false,
  defaultLevelId: 'level-01'
};

/**
 * Get current configuration based on environment
 */
export function getConfig(): AppConfig {
  // Vite provides import.meta.env.DEV for development mode
  return import.meta.env.DEV ? devConfig : prodConfig;
}

/**
 * Parse level ID from URL path
 * Examples:
 * - /webfun/2 -> level-02
 * - /webfun/1 -> level-01
 * - /2 -> level-02
 * - / -> null (use default)
 */
export function parseLevelFromURL(): string | null {
  const path = window.location.pathname;

  // Match last segment that is a number
  const match = path.match(/\/(\d+)\/?$/);

  if (match) {
    const levelNumber = parseInt(match[1], 10);
    // Convert 1 -> level-01, 2 -> level-02, etc.
    return `level-${String(levelNumber).padStart(2, '0')}`;
  }

  return null;
}
