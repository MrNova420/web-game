import * as THREE from 'three';
import { RealAssetTerrainGenerator } from './RealAssetTerrainGenerator';
import { VegetationManager } from './VegetationManager';
import { GrassSystem } from './GrassSystem';

/**
 * ChunkManager - Manages terrain chunks using REAL asset models
 * NO PlaneGeometry - uses actual tile models from extracted_assets
 */
export class ChunkManager {
  private chunks = new Map<string, THREE.Group>();
  private renderDistance = 2; // REDUCED from 5 to 2 for better performance (9 chunks instead of 121)
  private terrainGenerator: RealAssetTerrainGenerator;
  private vegetationManager: VegetationManager | null = null;
  private grassSystem: GrassSystem | null = null;
  private scene: THREE.Scene | null = null;
  private playerPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  constructor(terrainGenerator: RealAssetTerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
  }

  setScene(scene: THREE.Scene) {
    this.scene = scene;
  }

  setPlayerPosition(position: THREE.Vector3) {
    this.playerPosition.copy(position);
  }

  setVegetationManager(vegetationManager: VegetationManager) {
    this.vegetationManager = vegetationManager;
  }

  setGrassSystem(grassSystem: GrassSystem) {
    this.grassSystem = grassSystem;
  }

  // Standard update method for IntegrationManager
  update(deltaTime: number) {
    if (this.scene) {
      this.updateChunks(this.playerPosition, this.scene);
    }
  }

  async updateChunks(playerPosition: THREE.Vector3, scene: THREE.Scene) {
    const chunkX = Math.floor(playerPosition.x / 64);
    const chunkZ = Math.floor(playerPosition.z / 64);

    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const cx = chunkX + x;
        const cz = chunkZ + z;
        const key = `${cx},${cz}`;

        if (!this.chunks.has(key)) {
          // Generate terrain using REAL tile models
          const chunkGroup = await this.terrainGenerator.generateChunk(cx, cz, scene);
          this.chunks.set(key, chunkGroup);
          
          // Populate vegetation for this chunk
          if (this.vegetationManager) {
            await this.vegetationManager.populateChunk(cx, cz, scene);
          }

          // Add grass for this chunk
          if (this.grassSystem) {
            await this.grassSystem.populateChunk(cx, cz, scene);
          }
        }
      }
    }

    for (const [key, chunkGroup] of this.chunks.entries()) {
      const [cx, cz] = key.split(',').map(Number);
      const distance = Math.max(
        Math.abs(cx - chunkX),
        Math.abs(cz - chunkZ)
      );

      if (distance > this.renderDistance + 1) {
        this.terrainGenerator.removeChunk(cx, cz, scene);
        this.chunks.delete(key);
        
        // Remove vegetation for this chunk
        if (this.vegetationManager) {
          this.vegetationManager.removeChunkVegetation(cx, cz, scene);
        }

        // Remove grass for this chunk
        if (this.grassSystem) {
          this.grassSystem.removeChunkGrass(cx, cz, scene);
        }
      }
    }
  }
}
