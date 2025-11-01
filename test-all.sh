#!/bin/bash

# Comprehensive Game Testing Script
# Tests all aspects of the Fantasy Survival MMO Web Game

echo "=========================================="
echo "  FANTASY SURVIVAL MMO - COMPREHENSIVE TEST"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to run a test
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -e "${YELLOW}Running: ${test_name}${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ PASSED: ${test_name}${NC}"
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAILED: ${test_name}${NC}"
        echo ""
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

echo "Phase 1: CLIENT TESTING"
echo "========================"
cd client

run_test "Client Dependencies" "npm list --depth=0 > /dev/null 2>&1"
run_test "Client Type Check" "npm run type-check 2>&1 | tee /tmp/typecheck.log; grep -q 'error TS' /tmp/typecheck.log && exit 1 || exit 0"
run_test "Client Build" "npm run build"
run_test "Client Unit Tests" "npm run test:run"

echo ""
echo "Phase 2: SERVER TESTING"
echo "========================"
cd ../server

run_test "Server Dependencies" "npm list --depth=0 > /dev/null 2>&1"
run_test "Server Type Check" "npm run type-check"
run_test "Server Build" "npm run build"
run_test "Server Unit Tests" "npm run test:run"

echo ""
echo "Phase 3: INTEGRATION TESTING"
echo "=============================="
cd ../client

run_test "Integration Tests" "npm run test:run -- integration/"

echo ""
echo "Phase 4: STRESS TESTING"
echo "========================"

run_test "Performance Stress Tests" "npm run test:run -- stress/Performance.stress.test.ts"
run_test "Network Stress Tests" "npm run test:run -- stress/Network.stress.test.ts"

echo ""
echo "Phase 5: CODE QUALITY"
echo "======================"

run_test "Client Linting" "npm run lint 2>&1 | head -20"

cd ../server
run_test "Server Linting" "npm run lint 2>&1 | head -20"

echo ""
echo "=========================================="
echo "  TEST SUMMARY"
echo "=========================================="

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
    echo ""
    echo "Game is ready for deployment!"
    exit 0
else
    echo -e "${RED}✗ ${FAILURES} TEST(S) FAILED${NC}"
    echo ""
    echo "Please fix the failures before deployment."
    exit 1
fi
