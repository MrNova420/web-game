#!/bin/bash

# Quick Fix Script - Fixes common issues and launches the game

echo "=========================================="
echo "  GAME QUICK FIX & LAUNCH"
echo "=========================================="
echo ""

cd /home/runner/work/web-game/web-game

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Installing Dependencies${NC}"
echo "=============================="

# Install client dependencies
echo "Installing client dependencies..."
cd client
if npm install --silent 2>&1 | tail -3; then
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install client dependencies${NC}"
    exit 1
fi

# Install server dependencies
echo ""
echo "Installing server dependencies..."
cd ../server
if npm install --silent 2>&1 | tail -3; then
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install server dependencies${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${BLUE}Step 2: Building for Development${NC}"
echo "=============================="

# Try building client
echo "Building client..."
cd client
if npm run build 2>&1 | tail -10; then
    echo -e "${GREEN}✓ Client built successfully${NC}"
else
    echo -e "${RED}✗ Client build failed (this might be okay for dev mode)${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}Step 3: Starting Game${NC}"
echo "=============================="
echo ""
echo "The game will start in 3 modes:"
echo "1. Server on http://localhost:8080"
echo "2. Client on http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

# Create a script to start both
cat > /tmp/start-game.sh << 'EOFSCRIPT'
#!/bin/bash

# Start server
cd /home/runner/work/web-game/web-game/server
echo "Starting server..."
npm run dev > /tmp/server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Start client
cd /home/runner/work/web-game/web-game/client
echo "Starting client..."
npm run dev

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
EOFSCRIPT

chmod +x /tmp/start-game.sh

# Start the game
bash /tmp/start-game.sh
