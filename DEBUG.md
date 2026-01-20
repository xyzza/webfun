# Debug Mode Documentation

## Overview

Debug mode allows developers to quickly test specific levels during development by adding the level number to the URL.

## Configuration

Debug mode is controlled in `src/config.ts`:

```typescript
const devConfig: AppConfig = {
  debug: true,           // Enable in development
  defaultLevelId: 'level-01'
};

const prodConfig: AppConfig = {
  debug: false,          // Disable in production
  defaultLevelId: 'level-01'
};
```

## Environment Detection

- **Development mode** (`npm run dev`): `debug: true` automatically
- **Production mode** (`npm run build`): `debug: false` automatically

Detection uses Vite's `import.meta.env.DEV` flag.

## Usage

### Development Server

When running `npm run dev`, you can access specific levels via URL:

```
http://localhost:3001/         → Level 1 (default)
http://localhost:3001/1        → Level 1
http://localhost:3001/2        → Level 2
http://localhost:3001/webfun/2 → Level 2
```

### URL Pattern

The parser matches the **last numeric segment** in the URL path:
- `/1` → `level-01`
- `/2` → `level-02`
- `/webfun/3` → `level-03`

### Console Output

In debug mode, the console will show:

```
[DEBUG MODE ENABLED]
Add level number to URL to start from specific level:
  /1 or /webfun/1 - Level 1
  /2 or /webfun/2 - Level 2

[DEBUG] Starting with level from URL: level-02
```

## Implementation Details

### Files Modified

1. **src/config.ts** (new)
   - Environment-based configuration
   - URL parsing logic
   - Type definitions

2. **src/main.ts**
   - Imports configuration
   - Parses URL in debug mode
   - Passes starting level to Game

3. **src/Game.ts**
   - Constructor accepts optional `startingLevelId`
   - Stores initial level for restart functionality
   - Restart returns to debug-specified level

### Key Functions

```typescript
// Get current config based on environment
getConfig(): AppConfig

// Parse level from URL (e.g., "/2" → "level-02")
parseLevelFromURL(): string | null
```

## Production Behavior

In production builds (`npm run build`):
- Debug mode is **disabled**
- URL parsing is **skipped**
- Always starts from default level (`level-01`)
- No debug console messages

## Restart Behavior

When pressing 'R' to restart:
- **Without debug URL**: Returns to `level-01`
- **With debug URL** (e.g., `/2`): Returns to `level-02`

This preserves the debug testing workflow.

## Adding New Levels

When creating new levels (e.g., `level-03`):
1. Add level config to `src/levels/level-configs/level-03.json`
2. Register in `src/levels/level-configs/index.ts`
3. Access via URL: `http://localhost:3001/3`

No code changes needed for URL routing.
