import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';
import { BiomeSystem } from './BiomeSystem';

export class TerrainGenerator {
  private noise: any;
  private chunkSize = 64;
  private heightScale = 20;
  private biomeSystem: BiomeSystem;

  constructor(seed: number = Date.now()) {
    this.noise = createNoise2D(() => seed);
    this.biomeSystem = new BiomeSystem();
  }

  generateChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    const geometry = new THREE.PlaneGeometry(
      this.chunkSize,
      this.chunkSize,
      this.chunkSize - 1,
      this.chunkSize - 1
    );

    const vertices = geometry.attributes.position.array;
    const colors: number[] = [];

    // Calculate biome for chunk center
    const centerX = chunkX * this.chunkSize + this.chunkSize / 2;
    const centerZ = chunkZ * this.chunkSize + this.chunkSize / 2;
    const chunkBiome = this.getBiomeAt(centerX, centerZ);
    // Get biome color for future use
    // const biomeColor = new THREE.Color(this.biomeSystem.getBiomeColor(chunkBiome));

    for (let i = 0; i < vertices.length; i += 3) {
      const worldX = vertices[i] + chunkX * this.chunkSize;
      const worldZ = vertices[i + 1] + chunkZ * this.chunkSize;
      const biome = this.getBiomeAt(worldX, worldZ);
      const height = this.calculateHeight(worldX, worldZ, biome);
      vertices[i + 2] = height;

      // Add color for this vertex
      const color = new THREE.Color(this.biomeSystem.getBiomeColor(biome));
      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: false
    });

    return new THREE.Mesh(geometry, material);
  }

  private calculateHeight(x: number, z: number, biome: string): number {
    let height = 0;
    let amplitude = this.heightScale;
    let frequency = 0.005;

    // Apply biome-specific height modifier
    const heightModifier = this.biomeSystem.getBiomeHeightModifier(biome);

    for (let i = 0; i < 4; i++) {
      height += this.noise(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height * heightModifier;
  }

  public getHeight(x: number, z: number): number {
    const biome = this.getBiomeAt(x, z);
    return this.calculateHeight(x, z, biome);
  }

  getBiomeAt(x: number, z: number): string {
    const temperature = this.noise(x * 0.001, z * 0.001);
    const moisture = this.noise(x * 0.001 + 1000, z * 0.001 + 1000);
    const elevation = this.noise(x * 0.0005, z * 0.0005);

    // Mountain biome at high elevations
    if (elevation > 0.6) {
      return 'mountain';
    }

    // Mystical biome in rare spots
    if (temperature > 0.7 && moisture > 0.7) {
      return 'mystical';
    }

    // Temperature-based biomes
    if (temperature > 0.5) {
      return moisture > 0.2 ? 'forest' : 'desert';
    } else if (temperature > 0) {
      return moisture > 0.5 ? 'swamp' : 'plains';
    } else {
      return 'tundra';
    }
  }

  getBiomeSystem(): BiomeSystem {
    return this.biomeSystem;
  }
}
