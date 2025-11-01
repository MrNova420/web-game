import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';
import { VegetationManager } from './VegetationManager';

export class ChunkManager {
  private chunks = new Map<string, THREE.Mesh>();
  private renderDistance = 5;
  private terrainGenerator: TerrainGenerator;
  private vegetationManager: VegetationManager | null = null;

  constructor(terrainGenerator: TerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
  }

  setVegetationManager(vegetationManager: VegetationManager) {
    this.vegetationManager = vegetationManager;
  }

  async update(playerPosition: THREE.Vector3, scene: THREE.Scene) {
    const chunkX = Math.floor(playerPosition.x / 64);
    const chunkZ = Math.floor(playerPosition.z / 64);

    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        const cx = chunkX + x;
        const cz = chunkZ + z;
        const key = `${cx},${cz}`;

        if (!this.chunks.has(key)) {
          const chunk = this.terrainGenerator.generateChunk(cx, cz);
          chunk.position.set(cx * 64, 0, cz * 64);
          scene.add(chunk);
          this.chunks.set(key, chunk);
          
          // Populate vegetation for this chunk
          if (this.vegetationManager) {
            await this.vegetationManager.populateChunk(cx, cz, scene);
          }
        }
      }
    }

    for (const [key, chunk] of this.chunks.entries()) {
      const [cx, cz] = key.split(',').map(Number);
      const distance = Math.max(
        Math.abs(cx - chunkX),
        Math.abs(cz - chunkZ)
      );

      if (distance > this.renderDistance + 1) {
        scene.remove(chunk);
        chunk.geometry.dispose();
        (chunk.material as THREE.Material).dispose();
        this.chunks.delete(key);
        
        // Remove vegetation for this chunk
        if (this.vegetationManager) {
          this.vegetationManager.removeChunkVegetation(cx, cz, scene);
        }
      }
    }
  }
}
