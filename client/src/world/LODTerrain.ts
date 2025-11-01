import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';

/**
 * LODTerrain manages Level of Detail for terrain chunks
 * Closer chunks have higher detail, distant chunks have lower detail
 */
export class LODTerrain {
  private terrainGenerator: TerrainGenerator;
  private lodLevels = [
    { distance: 2, segments: 64 },  // High detail - close
    { distance: 4, segments: 32 },  // Medium detail
    { distance: 6, segments: 16 },  // Low detail - far
  ];

  constructor(terrainGenerator: TerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
  }

  /**
   * Generate a terrain chunk with appropriate LOD based on distance from player
   */
  generateChunk(chunkX: number, chunkZ: number, playerChunkX: number, playerChunkZ: number): THREE.Mesh {
    // Calculate distance from player
    const dx = chunkX - playerChunkX;
    const dz = chunkZ - playerChunkZ;
    const distance = Math.max(Math.abs(dx), Math.abs(dz));

    // Select appropriate LOD level
    let segments = 64; // Default high detail
    for (const level of this.lodLevels) {
      if (distance <= level.distance) {
        segments = level.segments;
        break;
      }
    }

    // Use lowest detail for farthest chunks
    if (distance > this.lodLevels[this.lodLevels.length - 1].distance) {
      segments = 8;
    }

    return this.generateChunkWithDetail(chunkX, chunkZ, segments);
  }

  /**
   * Generate a chunk with specific detail level
   */
  private generateChunkWithDetail(chunkX: number, chunkZ: number, segments: number): THREE.Mesh {
    const chunkSize = 64;
    const geometry = new THREE.PlaneGeometry(
      chunkSize,
      chunkSize,
      segments - 1,
      segments - 1
    );

    const vertices = geometry.attributes.position.array;
    const colors = new Float32Array(vertices.length);

    // Generate terrain heights and colors
    for (let i = 0; i < vertices.length; i += 3) {
      const worldX = vertices[i] + chunkX * chunkSize;
      const worldZ = vertices[i + 1] + chunkZ * chunkSize;
      
      const height = this.terrainGenerator.getHeight(worldX, worldZ);
      vertices[i + 2] = height;

      // Get biome color
      const biome = this.terrainGenerator.getBiomeAt(worldX, worldZ);
      const biomeSystem = this.terrainGenerator.getBiomeSystem();
      const biomeColor = new THREE.Color(biomeSystem.getBiomeColor(biome));
      
      colors[i] = biomeColor.r;
      colors[i + 1] = biomeColor.g;
      colors[i + 2] = biomeColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: false,
      side: THREE.DoubleSide
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Update LOD for an existing chunk if needed
   * Returns true if chunk needs to be regenerated
   */
  shouldUpdateLOD(chunkX: number, chunkZ: number, oldDistance: number, newDistance: number): boolean {
    const oldSegments = this.getSegmentsForDistance(oldDistance);
    const newSegments = this.getSegmentsForDistance(newDistance);
    return oldSegments !== newSegments;
  }

  /**
   * Get segment count for a given distance
   */
  private getSegmentsForDistance(distance: number): number {
    for (const level of this.lodLevels) {
      if (distance <= level.distance) {
        return level.segments;
      }
    }
    return 8; // Lowest detail
  }
}
