import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Resource node definition
 */
export interface ResourceNode {
  id: string;
  type: 'tree' | 'rock' | 'plant' | 'ore';
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  yields: { itemId: string; amount: number }[];
  model: THREE.Object3D;
}

/**
 * ResourceSystem - Manages harvestable resources using ONLY real asset models
 * Trees, rocks, and plants that can be gathered
 */
export class ResourceSystem {
  private assetLoader: AssetLoader;
  private resources = new Map<string, ResourceNode>();
  private nextId = 0;

  // Resource models from assets
  private resourceModels = {
    trees: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_5.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pine_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Pine_3.obj'
    ],
    rocks: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_2.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_3.obj'
    ],
    plants: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Plant_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Plant_7.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Bush_Common.obj'
    ]
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Spawn resource node using real model
   */
  async spawnResource(
    type: 'tree' | 'rock' | 'plant',
    position: THREE.Vector3,
    scene: THREE.Scene
  ): Promise<ResourceNode> {
    const id = `resource_${this.nextId++}`;
    
    let modelPath: string;
    let health: number;
    let yields: { itemId: string; amount: number }[];

    // Select appropriate model and configure yields
    switch (type) {
      case 'tree':
        modelPath = this.resourceModels.trees[Math.floor(Math.random() * this.resourceModels.trees.length)];
        health = 100;
        yields = [
          { itemId: 'wood', amount: Math.floor(Math.random() * 3) + 3 } // 3-5 wood
        ];
        break;
      case 'rock':
        modelPath = this.resourceModels.rocks[Math.floor(Math.random() * this.resourceModels.rocks.length)];
        health = 150;
        yields = [
          { itemId: 'stone', amount: Math.floor(Math.random() * 3) + 5 }, // 5-7 stone
          { itemId: 'ore', amount: Math.floor(Math.random() * 2) } // 0-1 ore
        ];
        break;
      case 'plant':
        modelPath = this.resourceModels.plants[Math.floor(Math.random() * this.resourceModels.plants.length)];
        health = 30;
        yields = [
          { itemId: 'herb', amount: Math.floor(Math.random() * 2) + 1 } // 1-2 herbs
        ];
        break;
    }

    try {
      const model = await this.assetLoader.loadModel(modelPath);
      model.position.copy(position);
      model.scale.set(2, 2, 2);
      model.userData.resourceId = id;
      model.userData.resourceType = type;
      
      scene.add(model);

      const resource: ResourceNode = {
        id,
        type,
        position: position.clone(),
        health,
        maxHealth: health,
        yields,
        model
      };

      this.resources.set(id, resource);
      console.log(`Spawned ${type} resource at`, position);
      
      return resource;

    } catch (error) {
      console.error('Failed to spawn resource:', error);
      throw error;
    }
  }

  /**
   * Damage resource (gathering)
   */
  damageResource(id: string, damage: number): { destroyed: boolean; yields?: { itemId: string; amount: number }[] } {
    const resource = this.resources.get(id);
    if (!resource) {
      return { destroyed: false };
    }

    resource.health -= damage;
    console.log(`Resource ${id} took ${damage} damage. Health: ${resource.health}/${resource.maxHealth}`);

    if (resource.health <= 0) {
      return { destroyed: true, yields: resource.yields };
    }

    return { destroyed: false };
  }

  /**
   * Remove resource (after gathering)
   */
  removeResource(id: string, scene: THREE.Scene) {
    const resource = this.resources.get(id);
    if (resource) {
      scene.remove(resource.model);
      
      // Dispose model
      resource.model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.resources.delete(id);
      console.log(`Removed resource ${id}`);
    }
  }

  /**
   * Get resource by ID
   */
  getResource(id: string): ResourceNode | undefined {
    return this.resources.get(id);
  }

  /**
   * Find nearest resource to position
   */
  findNearestResource(position: THREE.Vector3, maxDistance: number = 10): ResourceNode | null {
    let nearest: ResourceNode | null = null;
    let minDistance = maxDistance;

    this.resources.forEach((resource) => {
      const distance = position.distanceTo(resource.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = resource;
      }
    });

    return nearest;
  }

  /**
   * Get all resources
   */
  getAllResources(): ResourceNode[] {
    return Array.from(this.resources.values());
  }

  /**
   * Populate area with resources
   */
  async populateArea(
    centerX: number,
    centerZ: number,
    radius: number,
    scene: THREE.Scene,
    getHeight: (x: number, z: number) => number
  ) {
    const resourceCount = 20;
    const types: Array<'tree' | 'rock' | 'plant'> = ['tree', 'tree', 'tree', 'rock', 'rock', 'plant'];

    for (let i = 0; i < resourceCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const x = centerX + Math.cos(angle) * distance;
      const z = centerZ + Math.sin(angle) * distance;
      const y = getHeight(x, z);

      const type = types[Math.floor(Math.random() * types.length)];
      await this.spawnResource(type, new THREE.Vector3(x, y, z), scene);
    }

    console.log(`Populated area with ${resourceCount} resources`);
  }
}
