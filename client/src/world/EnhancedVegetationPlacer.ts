import * as THREE from 'three';

/**
 * EnhancedVegetationPlacer - Production-grade vegetation placement
 * ENHANCEMENT: Poisson disc sampling for natural distribution
 * Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section U
 */

interface PlacementRule {
  minDistance: number;
  maxDistance: number;
  minSlope: number;
  maxSlope: number;
  minHeight: number;
  maxHeight: number;
  density: number;
  biomes: string[];
}

interface VegetationPoint {
  position: THREE.Vector3;
  rotation: number;
  scale: number;
  assetType: string;
}

export class EnhancedVegetationPlacer {
  private placementRules: Map<string, PlacementRule>;
  
  constructor() {
    this.placementRules = new Map();
    this.initializeDefaultRules();
    console.log('[EnhancedVegetationPlacer] Initialized with natural distribution');
  }
  
  /**
   * Initialize default placement rules for different vegetation types
   */
  private initializeDefaultRules(): void {
    // Trees - sparse, avoid steep slopes
    this.placementRules.set('trees', {
      minDistance: 8,
      maxDistance: 15,
      minSlope: 0,
      maxSlope: 0.5,
      minHeight: 0,
      maxHeight: 80,
      density: 0.6,
      biomes: ['forest', 'plains', 'hills']
    });
    
    // Bushes - medium density
    this.placementRules.set('bushes', {
      minDistance: 3,
      maxDistance: 8,
      minSlope: 0,
      maxSlope: 0.7,
      minHeight: 0,
      maxHeight: 60,
      density: 0.4,
      biomes: ['forest', 'plains']
    });
    
    // Grass - dense, flat areas
    this.placementRules.set('grass', {
      minDistance: 1,
      maxDistance: 3,
      minSlope: 0,
      maxSlope: 0.3,
      minHeight: 0,
      maxHeight: 40,
      density: 0.8,
      biomes: ['plains', 'forest']
    });
    
    // Flowers - sparse, flat areas
    this.placementRules.set('flowers', {
      minDistance: 2,
      maxDistance: 5,
      minSlope: 0,
      maxSlope: 0.2,
      minHeight: 0,
      maxHeight: 30,
      density: 0.3,
      biomes: ['plains']
    });
    
    // Rocks - medium density, all heights
    this.placementRules.set('rocks', {
      minDistance: 5,
      maxDistance: 12,
      minSlope: 0,
      maxSlope: 1.0,
      minHeight: 0,
      maxHeight: 100,
      density: 0.5,
      biomes: ['mountain', 'hills', 'plains']
    });
    
    // Plants - medium density
    this.placementRules.set('plants', {
      minDistance: 2,
      maxDistance: 6,
      minSlope: 0,
      maxSlope: 0.4,
      minHeight: 0,
      maxHeight: 50,
      density: 0.5,
      biomes: ['forest', 'plains']
    });
  }
  
  /**
   * ADVANCED: Poisson disc sampling for natural object distribution
   * This creates evenly spaced but random-looking placement
   */
  generatePoissonPoints(
    bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
    minDistance: number,
    maxAttempts: number = 30
  ): THREE.Vector2[] {
    const points: THREE.Vector2[] = [];
    const cellSize = minDistance / Math.sqrt(2);
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxZ - bounds.minZ;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    
    // Grid for fast neighbor lookup
    const grid: (THREE.Vector2 | null)[][] = Array(cols).fill(null).map(() => Array(rows).fill(null));
    
    // Start with random point
    const firstPoint = new THREE.Vector2(
      bounds.minX + Math.random() * width,
      bounds.minZ + Math.random() * height
    );
    points.push(firstPoint);
    
    const activeList: THREE.Vector2[] = [firstPoint];
    const gridX = Math.floor((firstPoint.x - bounds.minX) / cellSize);
    const gridY = Math.floor((firstPoint.y - bounds.minZ) / cellSize);
    grid[gridX][gridY] = firstPoint;
    
    while (activeList.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeList.length);
      const point = activeList[randomIndex];
      let found = false;
      
      for (let i = 0; i < maxAttempts; i++) {
        // Generate random point around current point
        const angle = Math.random() * Math.PI * 2;
        const radius = minDistance + Math.random() * minDistance;
        const newPoint = new THREE.Vector2(
          point.x + Math.cos(angle) * radius,
          point.y + Math.sin(angle) * radius
        );
        
        // Check bounds
        if (newPoint.x < bounds.minX || newPoint.x >= bounds.maxX ||
            newPoint.y < bounds.minZ || newPoint.y >= bounds.maxZ) {
          continue;
        }
        
        // Check distance to neighbors
        const gx = Math.floor((newPoint.x - bounds.minX) / cellSize);
        const gy = Math.floor((newPoint.y - bounds.minZ) / cellSize);
        
        let valid = true;
        for (let dx = -2; dx <= 2 && valid; dx++) {
          for (let dy = -2; dy <= 2 && valid; dy++) {
            const nx = gx + dx;
            const ny = gy + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[nx][ny]) {
              const neighbor = grid[nx][ny]!;
              const dist = newPoint.distanceTo(neighbor);
              if (dist < minDistance) {
                valid = false;
              }
            }
          }
        }
        
        if (valid) {
          points.push(newPoint);
          activeList.push(newPoint);
          grid[gx][gy] = newPoint;
          found = true;
          break;
        }
      }
      
      if (!found) {
        activeList.splice(randomIndex, 1);
      }
    }
    
    return points;
  }
  
  /**
   * ADVANCED: Place vegetation in chunk with natural distribution
   */
  placeVegetationInChunk(
    chunkX: number,
    chunkZ: number,
    chunkSize: number,
    vegetationType: string,
    getTerrainHeight: (x: number, z: number) => number,
    getTerrainSlope: (x: number, z: number) => number,
    getBiome: (x: number, z: number) => string
  ): VegetationPoint[] {
    const rule = this.placementRules.get(vegetationType);
    if (!rule) {
      console.warn(`[EnhancedVegetationPlacer] No rule for type: ${vegetationType}`);
      return [];
    }
    
    const bounds = {
      minX: chunkX * chunkSize - chunkSize / 2,
      maxX: chunkX * chunkSize + chunkSize / 2,
      minZ: chunkZ * chunkSize - chunkSize / 2,
      maxZ: chunkZ * chunkSize + chunkSize / 2
    };
    
    // Generate candidate positions using Poisson disc sampling
    const candidatePoints = this.generatePoissonPoints(bounds, rule.minDistance);
    
    // Filter points based on terrain conditions
    const validPoints: VegetationPoint[] = [];
    
    for (const point of candidatePoints) {
      const worldX = point.x;
      const worldZ = point.y;
      
      // Get terrain properties
      const height = getTerrainHeight(worldX, worldZ);
      const slope = getTerrainSlope(worldX, worldZ);
      const biome = getBiome(worldX, worldZ);
      
      // Check placement rules
      if (height < rule.minHeight || height > rule.maxHeight) continue;
      if (slope < rule.minSlope || slope > rule.maxSlope) continue;
      if (!rule.biomes.includes(biome)) continue;
      
      // Apply density filter
      if (Math.random() > rule.density) continue;
      
      // Valid placement point
      validPoints.push({
        position: new THREE.Vector3(worldX, height, worldZ),
        rotation: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.4, // 80-120% scale variation
        assetType: vegetationType
      });
    }
    
    console.log(
      `[EnhancedVegetationPlacer] Placed ${validPoints.length} ${vegetationType} in chunk (${chunkX}, ${chunkZ})`
    );
    
    return validPoints;
  }
  
  /**
   * Set custom placement rule
   */
  setPlacementRule(type: string, rule: PlacementRule): void {
    this.placementRules.set(type, rule);
  }
  
  /**
   * Get placement rule
   */
  getPlacementRule(type: string): PlacementRule | undefined {
    return this.placementRules.get(type);
  }
}
