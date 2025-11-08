import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { createNoise2D } from 'simplex-noise';
import { BiomeSystem } from './BiomeSystem';

/**
 * AssetBasedTerrainGenerator - Builds terrain using ACTUAL models from Nature MegaKit
 * NO procedural geometry - uses real pebbles, rocks, and ground pieces
 */
export class AssetBasedTerrainGenerator {
  private assetLoader: AssetLoader;
  private noise: (x: number, y: number) => number;
  private biomeSystem: BiomeSystem;
  private chunkSize = 64;
  private heightScale = 20;
  private placedChunks = new Map<string, THREE.Group>();
  
  // Ground cover assets from Nature MegaKit
  private groundAssets = {
    pebbles: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Round_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Round_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Round_3.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Round_4.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Round_5.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_3.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_4.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_5.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pebble_Square_6.obj',
    ],
    rockPaths: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Round_Small_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Round_Small_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Round_Small_3.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Round_Thin.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Round_Wide.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Square_Small_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Square_Small_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Square_Small_3.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Square_Thin.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/RockPath_Square_Wide.obj',
    ],
    rocks: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_3.obj',
    ],
    clovers: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Clover_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Clover_2.obj',
    ]
  };

  constructor(assetLoader: AssetLoader, seed: number = Date.now()) {
    this.assetLoader = assetLoader;
    this.noise = createNoise2D(() => seed);
    this.biomeSystem = new BiomeSystem();
  }

  /**
   * Generate a chunk using ACTUAL ground assets
   */
  async generateChunk(chunkX: number, chunkZ: number, scene: THREE.Scene): Promise<THREE.Group> {
    const key = `${chunkX},${chunkZ}`;
    
    if (this.placedChunks.has(key)) {
      return this.placedChunks.get(key)!;
    }

    const chunkGroup = new THREE.Group();
    chunkGroup.name = `terrain_chunk_${key}`;
    
    const baseX = chunkX * this.chunkSize;
    const baseZ = chunkZ * this.chunkSize;
    
    // Determine biome for this chunk
    const centerX = baseX + this.chunkSize / 2;
    const centerZ = baseZ + this.chunkSize / 2;
    const biome = this.getBiomeAt(centerX, centerZ);
    
    // Place ground cover based on biome
    const density = this.getGroundCoverDensity(biome);
    
    // Place pebbles/rocks as ground cover
    for (let i = 0; i < density; i++) {
      const x = baseX + Math.random() * this.chunkSize;
      const z = baseZ + Math.random() * this.chunkSize;
      const height = this.getHeight(x, z);
      
      try {
        let groundModel;
        const rand = Math.random();
        
        if (rand < 0.6) {
          // 60% pebbles
          const pebbleAsset = this.groundAssets.pebbles[Math.floor(Math.random() * this.groundAssets.pebbles.length)];
          groundModel = await this.assetLoader.loadModel(pebbleAsset);
          groundModel.scale.set(1.5, 1.5, 1.5);
        } else if (rand < 0.85) {
          // 25% rock paths
          const rockPathAsset = this.groundAssets.rockPaths[Math.floor(Math.random() * this.groundAssets.rockPaths.length)];
          groundModel = await this.assetLoader.loadModel(rockPathAsset);
          groundModel.scale.set(2, 2, 2);
        } else {
          // 15% clovers for grass areas
          if (biome === 'plains' || biome === 'forest') {
            const cloverAsset = this.groundAssets.clovers[Math.floor(Math.random() * this.groundAssets.clovers.length)];
            groundModel = await this.assetLoader.loadModel(cloverAsset);
            groundModel.scale.set(1, 1, 1);
          } else {
            // Use rocks for non-grass biomes
            const rockAsset = this.groundAssets.rocks[Math.floor(Math.random() * this.groundAssets.rocks.length)];
            groundModel = await this.assetLoader.loadModel(rockAsset);
            groundModel.scale.set(0.5, 0.5, 0.5);
          }
        }
        
        if (groundModel) {
          groundModel.position.set(x, height, z);
          groundModel.rotation.y = Math.random() * Math.PI * 2;
          chunkGroup.add(groundModel);
        }
      } catch (error) {
        console.warn('Failed to load ground asset:', error);
      }
    }
    
    chunkGroup.position.set(0, 0, 0);
    scene.add(chunkGroup);
    this.placedChunks.set(key, chunkGroup);
    
    return chunkGroup;
  }

  /**
   * Remove a chunk
   */
  removeChunk(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    const chunkGroup = this.placedChunks.get(key);
    
    if (chunkGroup) {
      scene.remove(chunkGroup);
      
      // Dispose of all meshes in the group
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
      
      this.placedChunks.delete(key);
    }
  }

  /**
   * Calculate height using noise (for positioning models at correct height)
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
   * Get biome at position
   */
  getBiomeAt(x: number, z: number): string {
    const temperature = this.noise(x * 0.001, z * 0.001);
    const moisture = this.noise(x * 0.001 + 1000, z * 0.001 + 1000);
    const elevation = this.getHeight(x, z);

    // Mountain biome at high elevations
    if (elevation > 30) {
      return 'mountain';
    }

    // Mystical biome in special areas
    if (temperature > 0.7 && moisture > 0.7) {
      return 'mystical';
    }

    if (temperature > 0.5) {
      return moisture > 0.2 ? 'forest' : 'desert';
    } else if (temperature > 0) {
      return moisture > 0.5 ? 'swamp' : 'plains';
    } else {
      return 'tundra';
    }
  }

  /**
   * Get ground cover density based on biome
   */
  private getGroundCoverDensity(biome: string): number {
    const densities: Record<string, number> = {
      forest: 80,
      plains: 100,
      mountain: 120,
      desert: 60,
      swamp: 70,
      tundra: 40,
      mystical: 90
    };
    return densities[biome] || 80;
  }

  getBiomeSystem(): BiomeSystem {
    return this.biomeSystem;
  }
}
