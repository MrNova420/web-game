import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { createNoise2D } from 'simplex-noise';
import { BiomeSystem } from './BiomeSystem';

/**
 * REAL TerrainGenerator using ONLY actual asset models
 * NO PlaneGeometry - uses actual floor tile OBJ models from extracted_assets
 * Builds terrain by placing actual 3D tile models in a grid
 */
export class RealAssetTerrainGenerator {
  private assetLoader: AssetLoader;
  private noise: any;
  private biomeSystem: BiomeSystem;
  private chunkSize = 64;
  private tileSize = 2; // Each tile is roughly 2x2 units
  private heightScale = 20;
  private chunks = new Map<string, THREE.Group>();
  
  // PERFORMANCE FIX: Store instanced meshes for each tile type
  // Load ONE model, then copy/instance it many times (not cloning!)
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();
  private tileGeometries = new Map<string, THREE.BufferGeometry>();
  private tileMaterials = new Map<string, THREE.Material>();
  private instanceCounts = new Map<string, number>();
  private tempObject = new THREE.Object3D();
  
  // ACTUAL ground tile models organized by biome
  private terrainTiles = {
    forest: {
      // Use dirt and grass tiles for forest floor
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_large.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_A.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_B.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_weeds.obj',
      ]
    },
    plains: {
      // Use grass-like tiles
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_weeds.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small_weeds_B.obj',
      ]
    },
    mountain: {
      // Use stone tiles
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_large_rocks.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small_broken_A.obj',
      ]
    },
    desert: {
      // Use sandy/dirt tiles
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_large.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_A.obj',
      ]
    },
    swamp: {
      // Use wood and dirt tiles
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_wood_large.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_weeds.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_wood_small.obj',
      ]
    },
    tundra: {
      // Use stone tiles for frozen ground
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small_corner.obj',
      ]
    },
    mystical: {
      // Use decorated tiles
      tiles: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small_decorated.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small.obj',
      ]
    }
  };

  constructor(assetLoader: AssetLoader, seed: number = Date.now()) {
    this.assetLoader = assetLoader;
    this.noise = createNoise2D(() => seed);
    this.biomeSystem = new BiomeSystem();
    console.log('[TerrainGenerator] PERFORMANCE FIX: Using GPU instancing - load ONE model, copy many times');
  }

  /**
   * PERFORMANCE FIX: Pre-load all tile models and create instanced meshes
   * This loads each model ONCE and uses GPU instancing to render many copies
   */
  async preloadTileModels(scene: THREE.Scene): Promise<void> {
    console.log('[TerrainGenerator] Pre-loading tile models for instancing...');
    
    const allTilePaths = new Set<string>();
    
    // Collect all unique tile paths
    for (const biome of Object.values(this.terrainTiles)) {
      for (const tilePath of biome.tiles) {
        allTilePaths.add(tilePath);
      }
    }
    
    // Load each unique tile model ONCE
    for (const tilePath of allTilePaths) {
      try {
        const model = await this.assetLoader.loadModel(tilePath);
        
        // Extract geometry and material from model
        let geometry: THREE.BufferGeometry | null = null;
        let material: THREE.Material | null = null;
        
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && !geometry) {
            geometry = child.geometry.clone();
            material = child.material instanceof Array ? child.material[0].clone() : child.material.clone();
          }
        });
        
        if (geometry && material) {
          this.tileGeometries.set(tilePath, geometry);
          this.tileMaterials.set(tilePath, material);
          
          // Create instanced mesh with capacity for many instances
          // Estimate: 32x32 tiles per chunk, 5x5 chunks = 25600 tiles max
          const maxInstances = 30000;
          const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
          instancedMesh.castShadow = true;
          instancedMesh.receiveShadow = true;
          instancedMesh.count = 0; // Start with 0, will increment as we add instances
          
          scene.add(instancedMesh);
          this.instancedMeshes.set(tilePath, instancedMesh);
          this.instanceCounts.set(tilePath, 0);
          
          console.log(`[TerrainGenerator] Loaded and instanced: ${tilePath.split('/').pop()}`);
        }
      } catch (error) {
        console.warn(`[TerrainGenerator] Failed to load tile: ${tilePath}`, error);
      }
    }
    
    console.log(`[TerrainGenerator] Pre-loaded ${allTilePaths.size} unique tile models with instancing`);
  }

  /**
   * Generate terrain chunk using INSTANCED tile models (PERFORMANCE FIX)
   * Instead of cloning models, we use GPU instancing - ONE model, many copies
   */
  async generateChunk(chunkX: number, chunkZ: number, scene: THREE.Scene): Promise<THREE.Group> {
    const key = `${chunkX},${chunkZ}`;
    
    if (this.chunks.has(key)) {
      return this.chunks.get(key)!;
    }

    const chunkGroup = new THREE.Group();
    chunkGroup.name = `terrain_chunk_${key}`;
    
    const baseX = chunkX * this.chunkSize;
    const baseZ = chunkZ * this.chunkSize;
    
    // Calculate how many tiles fit in a chunk
    const tilesPerSide = Math.floor(this.chunkSize / this.tileSize);
    
    // Determine biome for chunk center
    const centerX = baseX + this.chunkSize / 2;
    const centerZ = baseZ + this.chunkSize / 2;
    const biome = this.getBiomeAt(centerX, centerZ);
    
    // Get tile assets for this biome
    const biomeData = this.terrainTiles[biome as keyof typeof this.terrainTiles] || this.terrainTiles.plains;
    
    // PERFORMANCE FIX: Use instancing instead of cloning
    // Place tiles in a grid using instanced meshes
    for (let x = 0; x < tilesPerSide; x++) {
      for (let z = 0; z < tilesPerSide; z++) {
        const worldX = baseX + x * this.tileSize;
        const worldZ = baseZ + z * this.tileSize;
        const height = this.getHeight(worldX, worldZ);
        
        try {
          // Random tile variation
          const tileAsset = biomeData.tiles[Math.floor(Math.random() * biomeData.tiles.length)];
          const instancedMesh = this.instancedMeshes.get(tileAsset);
          
          if (instancedMesh) {
            // Set position, rotation, scale for this instance
            this.tempObject.position.set(worldX, height, worldZ);
            this.tempObject.rotation.y = (Math.floor(Math.random() * 4)) * (Math.PI / 2);
            this.tempObject.scale.set(1, 1, 1);
            this.tempObject.updateMatrix();
            
            // Get current instance count for this tile type
            const currentCount = this.instanceCounts.get(tileAsset) || 0;
            
            // Set the matrix for this instance
            instancedMesh.setMatrixAt(currentCount, this.tempObject.matrix);
            
            // Increment count
            this.instanceCounts.set(tileAsset, currentCount + 1);
            instancedMesh.count = currentCount + 1;
            instancedMesh.instanceMatrix.needsUpdate = true;
          }
        } catch (error) {
          console.warn(`Failed to instance terrain tile:`, error);
        }
      }
    }
    
    this.chunks.set(key, chunkGroup);
    console.log(`Generated INSTANCED terrain chunk ${key} with ${tilesPerSide * tilesPerSide} tile instances for ${biome} biome`);
    
    return chunkGroup;
  }

  /**
   * Remove terrain chunk
   */
  removeChunk(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    const chunkGroup = this.chunks.get(key);
    
    if (chunkGroup) {
      scene.remove(chunkGroup);
      
      // Dispose all tiles
      chunkGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.chunks.delete(key);
    }
  }

  /**
   * Get height at position using noise
   */
  getHeight(x: number, z: number): number {
    const biome = this.getBiomeAt(x, z);
    const biomeModifier = this.biomeSystem.getBiomeHeightModifier(biome);
    
    let height = 0;
    let amplitude = this.heightScale * biomeModifier;
    let frequency = 0.005;

    for (let i = 0; i < 4; i++) {
      height += this.noise(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }

  /**
   * Determine biome at position
   */
  getBiomeAt(x: number, z: number): string {
    const temperature = this.noise(x * 0.001, z * 0.001);
    const moisture = this.noise(x * 0.001 + 1000, z * 0.001 + 1000);
    const elevation = this.getHeight(x, z);

    if (elevation > 30) return 'mountain';
    if (temperature > 0.7 && moisture > 0.7) return 'mystical';
    if (temperature > 0.5) return moisture > 0.2 ? 'forest' : 'desert';
    if (temperature > 0) return moisture > 0.5 ? 'swamp' : 'plains';
    return 'tundra';
  }

  getBiomeSystem(): BiomeSystem {
    return this.biomeSystem;
  }
}
