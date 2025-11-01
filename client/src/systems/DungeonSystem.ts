import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * DungeonSystem - Manages dungeon generation using ONLY real dungeon assets
 * Uses KayKit_DungeonRemastered OBJ models
 */
export class DungeonSystem {
  private assetLoader: AssetLoader;
  private dungeons = new Map<string, THREE.Group>();
  
  // Dungeon asset paths
  private dungeonAssets = {
    walls: {
      doorway: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/wall_doorway.obj',
      pillar: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/wall_pillar.obj',
      doorway_t: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/wall_doorway_Tsplit.obj'
    },
    floors: {
      tile_small: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_small.obj',
      tile_large: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_tile_large_rocks.obj',
      dirt_large: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/floor_dirt_large.obj'
    },
    stairs: {
      regular: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/stairs.obj',
      wide: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/stairs_wide.obj',
      long: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/stairs_long.obj',
      wood: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/stairs_wood.obj'
    },
    props: {
      chest_gold: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/chest_gold.obj',
      chest_lid: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/chest_lid.obj',
      torch: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/torch.obj',
      torch_lit: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/torch_lit.obj',
      torch_mounted: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/torch_mounted.obj',
      pillar: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/pillar.obj',
      pillar_decorated: '/extracted_assets/KayKit_DungeonRemastered/Assets/obj/pillar_decorated.obj'
    }
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Create a simple dungeon room using real dungeon assets
   */
  async createDungeonRoom(
    id: string,
    position: THREE.Vector3,
    size: { width: number; depth: number; height: number },
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    const dungeon = new THREE.Group();
    dungeon.name = `dungeon_${id}`;
    dungeon.position.copy(position);

    try {
      const roomSize = 4; // Size of each floor tile
      const tilesX = Math.floor(size.width / roomSize);
      const tilesZ = Math.floor(size.depth / roomSize);

      // Create floor
      for (let x = 0; x < tilesX; x++) {
        for (let z = 0; z < tilesZ; z++) {
          const floorTile = await this.assetLoader.loadModel(this.dungeonAssets.floors.tile_small);
          floorTile.position.set(x * roomSize, 0, z * roomSize);
          dungeon.add(floorTile);
        }
      }

      // Add walls around perimeter
      const wallHeight = size.height;
      
      // Front and back walls
      for (let x = 0; x < tilesX; x++) {
        // Front wall (with doorway in center)
        if (x === Math.floor(tilesX / 2)) {
          const doorway = await this.assetLoader.loadModel(this.dungeonAssets.walls.doorway);
          doorway.position.set(x * roomSize, wallHeight / 2, 0);
          dungeon.add(doorway);
        } else {
          const wall = await this.assetLoader.loadModel(this.dungeonAssets.walls.pillar);
          wall.position.set(x * roomSize, wallHeight / 2, 0);
          dungeon.add(wall);
        }

        // Back wall
        const backWall = await this.assetLoader.loadModel(this.dungeonAssets.walls.pillar);
        backWall.position.set(x * roomSize, wallHeight / 2, tilesZ * roomSize);
        backWall.rotation.y = Math.PI;
        dungeon.add(backWall);
      }

      // Side walls
      for (let z = 1; z < tilesZ; z++) {
        // Left wall
        const leftWall = await this.assetLoader.loadModel(this.dungeonAssets.walls.pillar);
        leftWall.position.set(0, wallHeight / 2, z * roomSize);
        leftWall.rotation.y = Math.PI / 2;
        dungeon.add(leftWall);

        // Right wall
        const rightWall = await this.assetLoader.loadModel(this.dungeonAssets.walls.pillar);
        rightWall.position.set(tilesX * roomSize, wallHeight / 2, z * roomSize);
        rightWall.rotation.y = -Math.PI / 2;
        dungeon.add(rightWall);
      }

      // Add torches on walls
      const torchSpacing = 8;
      for (let i = 0; i < Math.floor(size.width / torchSpacing); i++) {
        const torch = await this.assetLoader.loadModel(this.dungeonAssets.props.torch_lit);
        torch.position.set(i * torchSpacing + torchSpacing / 2, wallHeight - 1, 1);
        dungeon.add(torch);
      }

      // Add treasure chest in center
      const chest = await this.assetLoader.loadModel(this.dungeonAssets.props.chest_gold);
      chest.position.set((tilesX * roomSize) / 2, 0, (tilesZ * roomSize) / 2);
      dungeon.add(chest);

      // Add pillars at corners
      const corners = [
        { x: 2, z: 2 },
        { x: tilesX * roomSize - 2, z: 2 },
        { x: 2, z: tilesZ * roomSize - 2 },
        { x: tilesX * roomSize - 2, z: tilesZ * roomSize - 2 }
      ];

      for (const corner of corners) {
        const pillar = await this.assetLoader.loadModel(this.dungeonAssets.props.pillar_decorated);
        pillar.position.set(corner.x, 0, corner.z);
        dungeon.add(pillar);
      }

      scene.add(dungeon);
      this.dungeons.set(id, dungeon);

      console.log(`Created dungeon room ${id} at`, position);
      return dungeon;

    } catch (error) {
      console.error('Failed to create dungeon room:', error);
      throw error;
    }
  }

  /**
   * Place stairs connecting levels
   */
  async placeStairs(
    position: THREE.Vector3,
    type: keyof typeof this.dungeonAssets.stairs,
    scene: THREE.Scene
  ): Promise<THREE.Object3D> {
    try {
      const stairs = await this.assetLoader.loadModel(this.dungeonAssets.stairs[type]);
      stairs.position.copy(position);
      scene.add(stairs);
      return stairs;
    } catch (error) {
      console.error('Failed to place stairs:', error);
      throw error;
    }
  }

  /**
   * Place treasure chest
   */
  async placeChest(
    position: THREE.Vector3,
    scene: THREE.Scene
  ): Promise<THREE.Object3D> {
    try {
      const chest = await this.assetLoader.loadModel(this.dungeonAssets.props.chest_gold);
      chest.position.copy(position);
      scene.add(chest);
      return chest;
    } catch (error) {
      console.error('Failed to place chest:', error);
      throw error;
    }
  }

  /**
   * Remove dungeon
   */
  removeDungeon(id: string, scene: THREE.Scene) {
    const dungeon = this.dungeons.get(id);
    if (dungeon) {
      scene.remove(dungeon);
      
      // Dispose resources
      dungeon.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.dungeons.delete(id);
    }
  }

  /**
   * Get dungeon by ID
   */
  getDungeon(id: string): THREE.Group | undefined {
    return this.dungeons.get(id);
  }
}
