import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { TerrainGenerator } from './TerrainGenerator';

/**
 * TileBasedTerrain creates terrain using actual ground tile models from assets
 * This is for dungeons, buildings, and structured areas
 */
export class TileBasedTerrain {
  private assetLoader: AssetLoader;
  private terrainGenerator: TerrainGenerator;
  private placedTiles = new Map<string, THREE.Object3D[]>();
  
  // Ground tile assets organized by biome/area type
  private groundTiles = {
    dungeon: {
      dirt: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_large.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_A.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_B.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_C.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_small_D.obj',
      ],
      stone: [
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small.obj',
        '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_large_rocks.obj',
      ]
    },
    village: {
      wood: [
        '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_WoodLight.obj',
        '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_WoodDark_Half1.obj',
      ],
      brick: [
        '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_RedBrick.obj',
        '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_UnevenBrick.obj',
      ]
    }
  };

  constructor(assetLoader: AssetLoader, terrainGenerator: TerrainGenerator) {
    this.assetLoader = assetLoader;
    this.terrainGenerator = terrainGenerator;
  }

  /**
   * Create tile-based terrain for a specific area type (dungeon, village, etc.)
   * This uses actual ground tile models
   */
  async createTiledArea(
    centerX: number, 
    centerZ: number, 
    width: number, 
    depth: number, 
    areaType: 'dungeon' | 'village',
    tileType: string,
    scene: THREE.Scene
  ) {
    const key = `${centerX},${centerZ},${areaType}`;
    
    if (this.placedTiles.has(key)) {
      return; // Already created
    }

    const tiles: THREE.Object3D[] = [];
    const tileSize = 2; // Approximate size of each tile
    const tilesX = Math.floor(width / tileSize);
    const tilesZ = Math.floor(depth / tileSize);

    // Get appropriate tile assets
    let tileAssets: string[] = [];
    if (areaType === 'dungeon') {
      tileAssets = this.groundTiles.dungeon[tileType as 'dirt' | 'stone'] || this.groundTiles.dungeon.stone;
    } else if (areaType === 'village') {
      tileAssets = this.groundTiles.village[tileType as 'wood' | 'brick'] || this.groundTiles.village.wood;
    }

    if (tileAssets.length === 0) {
      console.warn(`No tile assets found for ${areaType}/${tileType}`);
      return;
    }

    // Place tiles in a grid
    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        const worldX = centerX - width/2 + x * tileSize;
        const worldZ = centerZ - depth/2 + z * tileSize;
        const height = this.terrainGenerator.getHeight(worldX, worldZ);
        
        try {
          // Random tile variation
          const tileAsset = tileAssets[Math.floor(Math.random() * tileAssets.length)];
          const tile = await this.assetLoader.loadModel(tileAsset);
          
          tile.position.set(worldX, height, worldZ);
          tile.rotation.y = (Math.floor(Math.random() * 4)) * (Math.PI / 2); // Random 90° rotation
          
          scene.add(tile);
          tiles.push(tile);
        } catch (error) {
          console.warn('Failed to load ground tile:', error);
        }
      }
    }

    this.placedTiles.set(key, tiles);
    console.log(`Created ${tiles.length} ground tiles for ${areaType} area`);
  }

  /**
   * Remove tiled area
   */
  removeTiledArea(centerX: number, centerZ: number, areaType: string, scene: THREE.Scene) {
    const key = `${centerX},${centerZ},${areaType}`;
    const tiles = this.placedTiles.get(key);
    
    if (tiles) {
      tiles.forEach(tile => {
        scene.remove(tile);
        tile.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      });
      this.placedTiles.delete(key);
    }
  }

  /**
   * Check if a position is within a tiled area
   */
  isInTiledArea(x: number, z: number): boolean {
    // TODO: Implement area detection
    // For now, return false (use procedural terrain)
    return false;
  }
}
