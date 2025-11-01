#!/bin/bash

# Game Diagnostics Script - Identifies and fixes issues

echo "=========================================="
echo "  GAME DIAGNOSTICS & REPAIR TOOL"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js installed: ${NODE_VERSION}${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm installed: ${NPM_VERSION}${NC}"
else
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Checking client dependencies...${NC}"
cd client
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Client dependencies not installed${NC}"
    echo -e "${BLUE}Installing client dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Client dependencies present${NC}"
fi

echo ""
echo -e "${BLUE}Checking server dependencies...${NC}"
cd ../server
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Server dependencies not installed${NC}"
    echo -e "${BLUE}Installing server dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Server dependencies present${NC}"
fi

cd ..

echo ""
echo -e "${BLUE}Testing client build...${NC}"
cd client
if npm run build -- --logLevel error 2>&1 | tail -5; then
    echo -e "${GREEN}✓ Client builds successfully${NC}"
else
    echo -e "${RED}✗ Client build failed${NC}"
    echo -e "${YELLOW}Run 'cd client && npm run dev' to see detailed errors${NC}"
fi

echo ""
echo -e "${BLUE}Testing server build...${NC}"
cd ../server
if npm run build 2>&1 | tail -5; then
    echo -e "${GREEN}✓ Server builds successfully${NC}"
else
    echo -e "${RED}✗ Server build failed${NC}"
    echo -e "${YELLOW}Run 'cd server && npm run dev' to see detailed errors${NC}"
fi

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}  DIAGNOSTIC COMPLETE${NC}"
echo "=========================================="
echo ""
echo "To launch the game:"
echo "  1. Quick start: ./quick-fix.sh"
echo "  2. Development: ./launch-game.sh dev"
echo "  3. Manual:"
echo "     Terminal 1: cd server && npm run dev"
echo "     Terminal 2: cd client && npm run dev"
echo ""
echo "For help: see TROUBLESHOOTING.md"
echo "=========================================="
