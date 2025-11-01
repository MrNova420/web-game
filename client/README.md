# Fantasy Survival MMO - Client

## Quick Start

### Development
```bash
npm run dev
```
Opens development server at http://localhost:3000

### Build
```bash
npm run build
```
Builds production-ready files to `dist/`

### Preview Build
```bash
npm run preview
```
Preview the production build locally

## Features Implemented

### ✅ Phase 1.1 - Infrastructure
- Three.js 3D rendering engine
- Vite build system with hot reload
- TypeScript for type safety
- React for UI (ready for future UI components)
- Socket.io client for multiplayer (ready)

### ✅ Phase 1.3 - Terrain System
- Procedural infinite terrain generation
- Chunk-based world streaming
- Multi-octave simplex noise
- Biome detection system (5 biomes)
- Automatic chunk loading/unloading

## Project Structure

```
client/
├── src/
│   ├── core/           # Core engine systems
│   │   └── Engine.ts   # Main 3D engine
│   ├── world/          # World generation
│   │   ├── TerrainGenerator.ts
│   │   └── ChunkManager.ts
│   ├── assets/         # Asset loading
│   │   └── AssetLoader.ts
│   ├── entities/       # Game entities (future)
│   ├── systems/        # Game systems (future)
│   ├── ui/            # UI components (future)
│   ├── utils/         # Utilities (future)
│   ├── config/        # Configuration (future)
│   ├── main.ts        # Entry point
│   └── style.css      # Global styles
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

## Controls (Current)
- Camera automatically orbits the terrain for testing
- Future: WASD movement, mouse look, etc.

## Performance
- 60 FPS target
- Chunk render distance: 5 chunks (configurable)
- Automatic memory management with chunk disposal
- Efficient instanced rendering (future vegetation)
