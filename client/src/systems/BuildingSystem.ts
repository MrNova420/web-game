import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * BuildingSystem - Manages buildings using ONLY real building models
 * Uses Medieval_Village_MegaKit OBJ models for walls, roofs, etc.
 */
export class BuildingSystem {
  private assetLoader: AssetLoader;
  private buildings = new Map<string, THREE.Group>();
  
  // Building component paths from your assets
  private buildingComponents = {
    walls: {
      plaster_straight: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_Plaster_Straight_Base.obj',
      plaster_door: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_Plaster_Door_Round.obj',
      plaster_window: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_Plaster_Window_Wide_Round.obj',
      brick_straight: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_UnevenBrick_Straight.obj',
      brick_door: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_UnevenBrick_Door_Round.obj',
      brick_window: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Wall_UnevenBrick_Window_Wide_Round.obj'
    },
    roofs: {
      round_4x4: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Roof_RoundTiles_4x4.obj',
      round_6x6: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Roof_RoundTiles_6x6.obj',
      round_8x8: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Roof_RoundTiles_8x8.obj',
      tower: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Roof_Tower_RoundTiles.obj'
    },
    floors: {
      wood_light: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_WoodLight.obj',
      wood_dark: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_WoodDark.obj',
      brick: '/extracted_assets/Medieval_Village_MegaKit/OBJ/Floor_RedBrick.obj'
    }
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Create a simple house using real building components
   */
  async createHouse(
    id: string,
    position: THREE.Vector3,
    type: 'small' | 'medium' | 'large',
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    const building = new THREE.Group();
    building.name = `house_${id}`;
    building.position.copy(position);
    
    try {
      // Load floor
      const floor = await this.assetLoader.loadModel(this.buildingComponents.floors.wood_light);
      floor.position.set(0, 0, 0);
      building.add(floor);
      
      // Load walls (4 walls for simple house)
      const wallHeight = 3;
      const wallSpacing = 4;
      
      // Front wall with door
      const frontWall = await this.assetLoader.loadModel(this.buildingComponents.walls.plaster_door);
      frontWall.position.set(0, wallHeight / 2, wallSpacing / 2);
      building.add(frontWall);
      
      // Back wall
      const backWall = await this.assetLoader.loadModel(this.buildingComponents.walls.plaster_straight);
      backWall.position.set(0, wallHeight / 2, -wallSpacing / 2);
      backWall.rotation.y = Math.PI;
      building.add(backWall);
      
      // Left wall with window
      const leftWall = await this.assetLoader.loadModel(this.buildingComponents.walls.plaster_window);
      leftWall.position.set(-wallSpacing / 2, wallHeight / 2, 0);
      leftWall.rotation.y = Math.PI / 2;
      building.add(leftWall);
      
      // Right wall
      const rightWall = await this.assetLoader.loadModel(this.buildingComponents.walls.plaster_straight);
      rightWall.position.set(wallSpacing / 2, wallHeight / 2, 0);
      rightWall.rotation.y = -Math.PI / 2;
      building.add(rightWall);
      
      // Load roof
      const roofType = type === 'small' ? 'round_4x4' : type === 'medium' ? 'round_6x6' : 'round_8x8';
      const roof = await this.assetLoader.loadModel(this.buildingComponents.roofs[roofType]);
      roof.position.set(0, wallHeight, 0);
      building.add(roof);
      
      // Add to scene
      scene.add(building);
      this.buildings.set(id, building);
      
      console.log(`Created ${type} house at`, position);
      return building;
      
    } catch (error) {
      console.error('Failed to create house:', error);
      throw error;
    }
  }

  /**
   * Remove building
   */
  removeBuilding(id: string, scene: THREE.Scene) {
    const building = this.buildings.get(id);
    if (building) {
      scene.remove(building);
      
      // Dispose resources
      building.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.buildings.delete(id);
    }
  }

  /**
   * Get building by ID
   */
  getBuilding(id: string): THREE.Group | undefined {
    return this.buildings.get(id);
  }
}
