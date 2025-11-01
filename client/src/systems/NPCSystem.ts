import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * NPCSystem - Manages NPCs using ONLY real character models
 * Uses KayKit_Adventurers GLB/FBX models
 */
export class NPCSystem {
  private gltfLoader: GLTFLoader;
  private assetLoader: AssetLoader;
  private npcs = new Map<string, THREE.Group>();
  
  // NPC model paths from your assets
  private npcAnimations = {
    general: '/extracted_assets/KayKit_Adventurers/Animations/gltf/Rig_Medium/Rig_Medium_General.glb',
    movement: '/extracted_assets/KayKit_Adventurers/Animations/gltf/Rig_Medium/Rig_Medium_MovementBasic.glb'
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Spawn NPC in world using real adventurer models
   */
  async spawnNPC(
    id: string,
    position: THREE.Vector3,
    type: 'merchant' | 'quest_giver' | 'guard',
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    try {
      // Load NPC animations (contains character model)
      const npcData = await this.gltfLoader.loadAsync(this.npcAnimations.general);
      const npc = npcData.scene;
      
      // Position NPC
      npc.position.copy(position);
      npc.scale.set(1, 1, 1);
      
      // Store NPC data
      npc.userData.type = type;
      npc.userData.id = id;
      
      // Add to scene
      scene.add(npc);
      this.npcs.set(id, npc);
      
      console.log(`Spawned ${type} NPC at`, position);
      return npc;
      
    } catch (error) {
      console.error('Failed to spawn NPC:', error);
      throw error;
    }
  }

  /**
   * Update NPC position
   */
  updateNPCPosition(id: string, position: THREE.Vector3) {
    const npc = this.npcs.get(id);
    if (npc) {
      npc.position.copy(position);
    }
  }

  /**
   * Update NPC rotation (look at target)
   */
  updateNPCRotation(id: string, target: THREE.Vector3) {
    const npc = this.npcs.get(id);
    if (npc) {
      npc.lookAt(target);
    }
  }

  /**
   * Remove NPC
   */
  removeNPC(id: string, scene: THREE.Scene) {
    const npc = this.npcs.get(id);
    if (npc) {
      scene.remove(npc);
      
      // Dispose resources
      npc.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.npcs.delete(id);
    }
  }

  /**
   * Get NPC by ID
   */
  getNPC(id: string): THREE.Group | undefined {
    return this.npcs.get(id);
  }

  /**
   * Get all NPC IDs
   */
  getAllNPCIds(): string[] {
    return Array.from(this.npcs.keys());
  }
}
