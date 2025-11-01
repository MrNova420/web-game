import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export class TerrainGenerator {
  private noise: any;
  private chunkSize = 64;
  private heightScale = 20;

  constructor(seed: number = Date.now()) {
    this.noise = createNoise2D(() => seed);
  }

  generateChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      this.chunkSize - 1,
      this.chunkSize - 1
    );

    const vertices = geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const worldX = vertices[i] + chunkX * this.chunkSize;
      const worldZ = vertices[i + 1] + chunkZ * this.chunkSize;
      const height = this.calculateHeight(worldX, worldZ);
      vertices[i + 2] = height;
    }

    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      flatShading: false
    });

    return new THREE.Mesh(geometry, material);
  }

  private calculateHeight(x: number, z: number): number {
    let height = 0;
    let amplitude = this.heightScale;
    let frequency = 0.005;

    for (let i = 0; i < 4; i++) {
      height += this.noise(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }

  public getHeight(x: number, z: number): number {
    return this.calculateHeight(x, z);
  }

  getBiomeAt(x: number, z: number): string {
    const temperature = this.noise(x * 0.001, z * 0.001);
    const moisture = this.noise(x * 0.001 + 1000, z * 0.001 + 1000);

    if (temperature > 0.5) {
      return moisture > 0.2 ? 'forest' : 'desert';
    } else if (temperature > 0) {
      return moisture > 0.5 ? 'swamp' : 'plains';
    } else {
      return 'tundra';
    }
  }
}
