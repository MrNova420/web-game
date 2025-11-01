import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * EnemySystem - Manages enemies using ONLY real skeleton models
 * Uses KayKit_Skeletons GLB/FBX models
 */
export class EnemySystem {
  private gltfLoader: GLTFLoader;
  private assetLoader: AssetLoader;
  private enemies = new Map<string, THREE.Group>();
  
  // Enemy model paths from your assets
  private enemyModels = {
    minion: '/extracted_assets/KayKit_Skeletons/characters/gltf/Skeleton_Minion.glb',
    warrior: '/extracted_assets/KayKit_Skeletons/characters/gltf/Skeleton_Warrior.glb',
    rogue: '/extracted_assets/KayKit_Skeletons/characters/gltf/Skeleton_Rogue.glb',
    mage: '/extracted_assets/KayKit_Skeletons/characters/gltf/Skeleton_Mage.glb'
  };
  
  private enemyAnimations = {
    general: '/extracted_assets/KayKit_Skeletons/Animations/gltf/Rig_Medium/Rig_Medium_General.glb',
    movement: '/extracted_assets/KayKit_Skeletons/Animations/gltf/Rig_Medium/Rig_Medium_MovementBasic.glb'
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.gltfLoader = new GLTFLoader();
  }

  /**
   * Spawn enemy in world using real skeleton models
   */
  async spawnEnemy(
    id: string,
    position: THREE.Vector3,
    type: keyof typeof this.enemyModels,
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    try {
      // Load enemy model
      const modelPath = this.enemyModels[type];
      const enemyData = await this.gltfLoader.loadAsync(modelPath);
      const enemy = enemyData.scene;
      
      // Position enemy
      enemy.position.copy(position);
      enemy.scale.set(1, 1, 1);
      
      // Store enemy data
      enemy.userData.type = type;
      enemy.userData.id = id;
      enemy.userData.health = this.getEnemyHealth(type);
      enemy.userData.damage = this.getEnemyDamage(type);
      
      // Add to scene
      scene.add(enemy);
      this.enemies.set(id, enemy);
      
      console.log(`Spawned ${type} enemy at`, position);
      return enemy;
      
    } catch (error) {
      console.error('Failed to spawn enemy:', error);
      throw error;
    }
  }

  /**
   * Get enemy health based on type
   */
  private getEnemyHealth(type: string): number {
    const healthMap: Record<string, number> = {
      minion: 50,
      warrior: 150,
      rogue: 100,
      mage: 80
    };
    return healthMap[type] || 100;
  }

  /**
   * Get enemy damage based on type
   */
  private getEnemyDamage(type: string): number {
    const damageMap: Record<string, number> = {
      minion: 10,
      warrior: 25,
      rogue: 20,
      mage: 30
    };
    return damageMap[type] || 15;
  }

  /**
   * Update enemy position (AI movement)
   */
  updateEnemyPosition(id: string, position: THREE.Vector3) {
    const enemy = this.enemies.get(id);
    if (enemy) {
      enemy.position.copy(position);
    }
  }

  /**
   * Update enemy rotation (face target)
   */
  updateEnemyRotation(id: string, target: THREE.Vector3) {
    const enemy = this.enemies.get(id);
    if (enemy) {
      enemy.lookAt(target);
    }
  }

  /**
   * Damage enemy
   */
  damageEnemy(id: string, damage: number): boolean {
    const enemy = this.enemies.get(id);
    if (enemy) {
      enemy.userData.health -= damage;
      console.log(`Enemy ${id} took ${damage} damage. Health: ${enemy.userData.health}`);
      
      if (enemy.userData.health <= 0) {
        return true; // Enemy dead
      }
    }
    return false;
  }

  /**
   * Remove enemy (death)
   */
  removeEnemy(id: string, scene: THREE.Scene) {
    const enemy = this.enemies.get(id);
    if (enemy) {
      scene.remove(enemy);
      
      // Dispose resources
      enemy.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      
      this.enemies.delete(id);
      console.log(`Removed enemy ${id}`);
    }
  }

  /**
   * Get enemy by ID
   */
  getEnemy(id: string): THREE.Group | undefined {
    return this.enemies.get(id);
  }

  /**
   * Get all enemy IDs
   */
  getAllEnemyIds(): string[] {
    return Array.from(this.enemies.keys());
  }

  /**
   * Update all enemies (AI tick)
   */
  updateAll(deltaTime: number, playerPosition: THREE.Vector3) {
    this.enemies.forEach((enemy, id) => {
      // Simple AI: move towards player
      const direction = new THREE.Vector3()
        .subVectors(playerPosition, enemy.position)
        .normalize();
      
      // Move enemy towards player (simple AI)
      const speed = 2.0; // units per second
      enemy.position.add(direction.multiplyScalar(speed * deltaTime));
      
      // Face player
      enemy.lookAt(playerPosition);
    });
  }
}
