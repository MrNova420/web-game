#!/bin/bash

# Performance Optimization Script
# Optimizes game for production deployment

echo "=========================================="
echo "  GAME PERFORMANCE OPTIMIZATION"
echo "=========================================="
echo ""

cd /home/runner/work/web-game/web-game/client

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Analyze Bundle Size
echo -e "${BLUE}1. Bundle Size Analysis${NC}"
echo "=============================="

npm run build > /tmp/build-output.log 2>&1

if [ -f dist/index.html ]; then
    echo "Build successful!"
    echo ""
    echo "Bundle sizes:"
    ls -lh dist/assets/*.js | awk '{print $9, $5}'
    echo ""
    
    # Calculate total size
    TOTAL_SIZE=$(du -sh dist | awk '{print $1}')
    echo "Total dist size: $TOTAL_SIZE"
    
    # Check if gzipped sizes are shown
    if grep -q "gzip" /tmp/build-output.log; then
        echo ""
        echo "Gzipped sizes:"
        grep "gzip" /tmp/build-output.log | grep -E "kB|MB"
    fi
else
    echo "Build failed!"
    cat /tmp/build-output.log
    exit 1
fi

# 2. Check for optimization opportunities
echo ""
echo -e "${BLUE}2. Optimization Opportunities${NC}"
echo "=============================="

# Check for large chunks
LARGE_CHUNKS=$(ls -l dist/assets/*.js | awk '$5 > 500000 {print $9}' | wc -l)
echo "Chunks > 500KB: $LARGE_CHUNKS"

if [ $LARGE_CHUNKS -gt 0 ]; then
    echo -e "${YELLOW}⚠ Consider code splitting for large chunks${NC}"
fi

# 3. Memory optimization check
echo ""
echo -e "${BLUE}3. Memory Optimization${NC}"
echo "=============================="

# Check for potential memory leaks
echo "Checking for common memory leak patterns..."

LEAK_PATTERNS=0

# Check for addEventListener without removeEventListener
if grep -r "addEventListener" client/src --include="*.ts" --include="*.tsx" | grep -v "removeEventListener" > /tmp/listeners.txt; then
    COUNT=$(wc -l < /tmp/listeners.txt)
    if [ $COUNT -gt 0 ]; then
        echo "⚠ Found $COUNT addEventListener calls - verify cleanup"
        LEAK_PATTERNS=$((LEAK_PATTERNS + 1))
    fi
fi

# Check for setInterval without clearInterval
if grep -r "setInterval" client/src --include="*.ts" --include="*.tsx" | grep -v "clearInterval" > /tmp/intervals.txt; then
    COUNT=$(wc -l < /tmp/intervals.txt)
    if [ $COUNT -gt 0 ]; then
        echo "⚠ Found $COUNT setInterval calls - verify cleanup"
        LEAK_PATTERNS=$((LEAK_PATTERNS + 1))
    fi
fi

if [ $LEAK_PATTERNS -eq 0 ]; then
    echo "✓ No obvious memory leak patterns detected"
fi

# 4. Asset optimization
echo ""
echo -e "${BLUE}4. Asset Optimization${NC}"
echo "=============================="

if [ -d ../extracted_assets ]; then
    # Count different asset types
    TEXTURES=$(find ../extracted_assets -name "*.png" -o -name "*.jpg" | wc -l)
    MODELS=$(find ../extracted_assets -name "*.obj" -o -name "*.fbx" -o -name "*.glb" | wc -l)
    AUDIO=$(find ../extracted_assets -name "*.wav" -o -name "*.mp3" | wc -l)
    
    echo "Assets available:"
    echo "  Textures: $TEXTURES"
    echo "  Models: $MODELS"
    echo "  Audio: $AUDIO"
    echo ""
    echo "✓ All assets should be loaded on-demand, not bundled"
fi

# 5. Performance recommendations
echo ""
echo -e "${BLUE}5. Performance Recommendations${NC}"
echo "=============================="

echo "✓ Use dynamic imports for large systems"
echo "✓ Implement asset preloading for critical resources"
echo "✓ Use texture compression (basis, ktx2)"
echo "✓ Enable HTTP/2 for parallel asset loading"
echo "✓ Implement progressive loading for models"
echo "✓ Use LOD (Level of Detail) for distant objects"
echo "✓ Pool frequently created objects"
echo "✓ Batch draw calls where possible"

echo ""
echo "=========================================="
echo "  OPTIMIZATION COMPLETE"
echo "=========================================="
