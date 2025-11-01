import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';

export class ChunkManager {
  private chunks = new Map<string, THREE.Mesh>();
  private renderDistance = 5;
  private terrainGenerator: TerrainGenerator;

  constructor(terrainGenerator: TerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
  }

  update(playerPosition: THREE.Vector3, scene: THREE.Scene) {
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
      }
    }
  }
}
