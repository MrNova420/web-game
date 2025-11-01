# Fantasy Survival MMO - Server

## Quick Start

### Development
```bash
npm run dev
```
Starts development server with hot reload on port 8080

### Build
```bash
npm run build
```
Compiles TypeScript to JavaScript in `dist/`

### Production
```bash
npm start
```
Runs the compiled server from `dist/`

## Features Implemented

### ✅ Phase 1.1 - Infrastructure
- Express HTTP server
- Socket.io WebSocket server for real-time multiplayer
- TypeScript for type safety
- CORS enabled for development
- Nodemon for auto-restart during development

## Project Structure

```
server/
├── src/
│   └── server.ts      # Main server entry point
├── dist/              # Compiled JavaScript (generated)
├── tsconfig.json      # TypeScript configuration
└── package.json       # Dependencies
```

## WebSocket Events

### Client → Server
- `player:move` - Player movement updates

### Server → Client
- `player:update` - Broadcast player updates to other clients

## Configuration
- Default port: 8080
- Can be changed via PORT environment variable
- CORS: Accepts all origins (for development)

## Future Features
- Player authentication
- World state synchronization
- NPC AI
- Combat system
- Inventory management
- Database integration
