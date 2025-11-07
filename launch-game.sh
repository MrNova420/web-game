#!/bin/bash

# Game Launcher Script
# Starts the game in development or production mode

MODE=${1:-dev}

echo "=========================================="
echo "  FANTASY SURVIVAL MMO - LAUNCHER"
echo "=========================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠ Node.js $NODE_VERSION detected. Recommended: 18+${NC}"
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check if dependencies are installed
if [ ! -d "client/node_modules" ]; then
    echo -e "${YELLOW}⚠ Client dependencies not found. Installing...${NC}"
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}⚠ Server dependencies not found. Installing...${NC}"
    cd server && npm install && cd ..
fi

echo -e "${GREEN}✓ Dependencies ready${NC}"
echo ""

# Setup assets symlink if not exists
if [ ! -L "client/public/extracted_assets" ]; then
    echo -e "${BLUE}Setting up assets symlink...${NC}"
    mkdir -p client/public
    cd client/public
    ln -sf ../../extracted_assets .
    cd ../..
    echo -e "${GREEN}✓ Assets symlink created${NC}"
fi

# Launch based on mode
if [ "$MODE" = "dev" ]; then
    echo -e "${BLUE}Starting in DEVELOPMENT mode...${NC}"
    echo ""
    echo "Server will start on: http://localhost:8080"
    echo "Client will start on: http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""
    
    # Start server in background
    cd server
    # Use local log file instead of /tmp to avoid permission issues
    npm run dev > ../server.log 2>&1 &
    SERVER_PID=$!
    echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
    
    # Wait for server to start
    sleep 3
    
    # Start client
    cd ../client
    echo -e "${GREEN}✓ Starting client...${NC}"
    npm run dev
    
    # Cleanup on exit
    kill $SERVER_PID 2>/dev/null
    
elif [ "$MODE" = "prod" ]; then
    echo -e "${BLUE}Starting in PRODUCTION mode...${NC}"
    echo ""
    
    # Build if needed
    if [ ! -d "client/dist" ]; then
        echo "Building client..."
        cd client && npm run build && cd ..
    fi
    
    if [ ! -d "server/dist" ]; then
        echo "Building server..."
        cd server && npm run build && cd ..
    fi
    
    echo -e "${GREEN}✓ Builds ready${NC}"
    echo ""
    echo "Server running on: http://localhost:8080"
    echo ""
    
    # Start server
    cd server
    npm start
    
elif [ "$MODE" = "test" ]; then
    echo -e "${BLUE}Running TESTS...${NC}"
    echo ""
    
    ./test-all.sh
    
elif [ "$MODE" = "build" ]; then
    echo -e "${BLUE}Building for PRODUCTION...${NC}"
    echo ""
    
    echo "Building client..."
    cd client && npm run build
    echo -e "${GREEN}✓ Client built${NC}"
    
    echo ""
    echo "Building server..."
    cd ../server && npm run build
    echo -e "${GREEN}✓ Server built${NC}"
    
    echo ""
    echo -e "${GREEN}✓ Production build complete!${NC}"
    echo ""
    echo "Files ready in:"
    echo "  - client/dist/"
    echo "  - server/dist/"
    
elif [ "$MODE" = "status" ]; then
    ./check-game-status.sh
    
else
    echo "Usage: $0 [dev|prod|test|build|status]"
    echo ""
    echo "Modes:"
    echo "  dev    - Start development servers (default)"
    echo "  prod   - Start production server"
    echo "  test   - Run all tests"
    echo "  build  - Build for production"
    echo "  status - Check game status"
    exit 1
fi
