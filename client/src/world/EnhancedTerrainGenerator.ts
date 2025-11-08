import * as THREE from 'three';
import { createNoise2D, createNoise3D, NoiseFunction2D, NoiseFunction3D } from 'simplex-noise';

/**
 * EnhancedTerrainGenerator - Advanced terrain generation with multi-octave noise
 * ENHANCEMENT: Multiple noise layers for realistic terrain
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 3.1
 */

interface NoiseConfig {
  octaves: number;
  frequency: number;
  amplitude: number;
  persistence: number;
  lacunarity: number;
}

export class EnhancedTerrainGenerator {
  private noise2D: NoiseFunction2D;
  private noise3D: NoiseFunction3D;
  private erosionNoise: NoiseFunction2D;
  private ridgeNoise: NoiseFunction2D;

  // ADVANCED: Multi-octave noise with proper parameters
  private noiseConfig = {
    continental: {
      octaves: 8,
      frequency: 0.0001,
      amplitude: 100,
      persistence: 0.5,
      lacunarity: 2.0,
    },
    regional: {
      octaves: 6,
      frequency: 0.001,
      amplitude: 40,
      persistence: 0.55,
      lacunarity: 2.1,
    },
    local: {
      octaves: 4,
      frequency: 0.01,
      amplitude: 10,
      persistence: 0.6,
      lacunarity: 2.2,
    },
    detail: {
      octaves: 3,
      frequency: 0.1,
      amplitude: 2,
      persistence: 0.65,
      lacunarity: 2.3,
    },
  };

  constructor(seed: number = 12345) {
    // Create noise functions with different seeds
    this.noise2D = createNoise2D(() => seed);
    this.noise3D = createNoise3D(() => seed + 1);
    this.erosionNoise = createNoise2D(() => seed + 2);
    this.ridgeNoise = createNoise2D(() => seed + 3);

    console.log('[EnhancedTerrainGenerator] Initialized with seed:', seed);
  }

  /**
   * Generate advanced terrain chunk with high quality
   */
  generateAdvancedChunk(chunkX: number, chunkZ: number): THREE.Mesh {
    const resolution = 128; // Balance between quality and performance
    const chunkSize = 64;

    const geometry = new THREE.PlaneGeometry(
      chunkSize,
      chunkSize,
      resolution - 1,
      resolution - 1
    );

    const vertices = geometry.attributes.position.array as Float32Array;
    const uvs = geometry.attributes.uv.array as Float32Array;

    // ADVANCED: Store comprehensive vertex data
    const vertexDataSize = 8; // [height, slope, curvature, moisture, temperature, vegetation, erosion, ao]
    const vertexData = new Float32Array((vertices.length / 3) * vertexDataSize);

    // Generate height data
    for (let i = 0, j = 0; i < vertices.length; i += 3, j += vertexDataSize) {
      const localX = vertices[i];
      const localZ = vertices[i + 1];
      const worldX = localX + chunkX * chunkSize;
      const worldZ = localZ + chunkZ * chunkSize;

      // ADVANCED: Multi-scale height calculation
      const height = this.calculateAdvancedHeight(worldX, worldZ);
      vertices[i + 2] = height;
      vertexData[j] = height;

      // Calculate slope (gradient)
      const dx = this.calculateAdvancedHeight(worldX + 1, worldZ) - height;
      const dz = this.calculateAdvancedHeight(worldX, worldZ + 1) - height;
      const slope = Math.sqrt(dx * dx + dz * dz);
      vertexData[j + 1] = slope;

      // Calculate curvature (for erosion)
      const d2x =
        this.calculateAdvancedHeight(worldX + 2, worldZ) -
        2 * height +
        this.calculateAdvancedHeight(worldX - 2, worldZ);
      const d2z =
        this.calculateAdvancedHeight(worldX, worldZ + 2) -
        2 * height +
        this.calculateAdvancedHeight(worldX, worldZ - 2);
      const curvature = Math.abs(d2x) + Math.abs(d2z);
      vertexData[j + 2] = curvature;

      // Environmental factors with proper noise
      vertexData[j + 3] = this.calculateMoisture(worldX, worldZ, height);
      vertexData[j + 4] = this.calculateTemperature(worldX, worldZ, height);
      vertexData[j + 5] = this.calculateVegetationDensity(worldX, worldZ, height, slope);

      // Hydraulic erosion simulation
      vertexData[j + 6] = this.calculateErosion(worldX, worldZ, height, slope, curvature);

      // Ambient occlusion (approximate)
      vertexData[j + 7] = this.calculateAO(i / 3, vertices, resolution);
    }

    // CRITICAL: Compute high-quality normals
    geometry.computeVertexNormals();

    // Rotate to horizontal
    geometry.rotateX(-Math.PI / 2);

    // Store vertex data as buffer attribute
    geometry.setAttribute('vertexData', new THREE.BufferAttribute(vertexData, vertexDataSize));

    // Create material (will be replaced by material system)
    const material = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      roughness: 0.9,
      metalness: 0.0,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;

    return mesh;
  }

  /**
   * ADVANCED: Multi-scale height calculation
   */
  private calculateAdvancedHeight(x: number, z: number): number {
    let height = 0;

    // ADVANCED: Multi-scale noise layers
    // Continental scale (large landmasses)
    const continental = this.multiOctaveNoise(
      x * this.noiseConfig.continental.frequency,
      z * this.noiseConfig.continental.frequency,
      this.noiseConfig.continental
    );

    // Regional scale (mountains, valleys)
    const regional = this.multiOctaveNoise(
      x * this.noiseConfig.regional.frequency,
      z * this.noiseConfig.regional.frequency,
      this.noiseConfig.regional
    );

    // Local scale (hills, ridges)
    const local = this.multiOctaveNoise(
      x * this.noiseConfig.local.frequency,
      z * this.noiseConfig.local.frequency,
      this.noiseConfig.local
    );

    // Detail scale (small features)
    const detail = this.multiOctaveNoise(
      x * this.noiseConfig.detail.frequency,
      z * this.noiseConfig.detail.frequency,
      this.noiseConfig.detail
    );

    // Combine scales with proper weighting
    height = continental * 0.4 + regional * 0.3 + local * 0.2 + detail * 0.1;

    // ADVANCED: Ridged noise for mountain ranges
    const ridgeValue = 1 - Math.abs(this.ridgeNoise(x * 0.003, z * 0.003));
    const ridgeWeight = Math.max(0, continental * 0.01);
    height += Math.pow(ridgeValue, 2) * 30 * ridgeWeight;

    // ADVANCED: Plateau formation
    const plateauNoise = this.noise2D(x * 0.0008, z * 0.0008);
    if (plateauNoise > 0.3) {
      const plateauHeight = Math.floor(height / 15) * 15;
      const blend = (plateauNoise - 0.3) / 0.7;
      height = height * (1 - blend) + plateauHeight * blend;
    }

    // ADVANCED: Valley carving
    const valleyNoise = this.noise2D(x * 0.002 + 5000, z * 0.002 + 5000);
    if (valleyNoise < 0.3) {
      const valleyDepth = (0.3 - valleyNoise) * 40;
      height -= valleyDepth;
    }

    return Math.max(0, height);
  }

  /**
   * Multi-octave noise generation
   */
  private multiOctaveNoise(x: number, z: number, config: NoiseConfig): number {
    let value = 0;
    let amplitude = config.amplitude;
    let frequency = 1.0;
    let maxValue = 0;

    for (let octave = 0; octave < config.octaves; octave++) {
      value += this.noise2D(x * frequency, z * frequency) * amplitude;
      maxValue += amplitude;

      amplitude *= config.persistence;
      frequency *= config.lacunarity;
    }

    return value / maxValue; // Normalize
  }

  /**
   * Calculate moisture level
   */
  private calculateMoisture(x: number, z: number, height: number): number {
    const moistureNoise = this.noise2D(x * 0.005, z * 0.005);
    // Lower areas have more moisture
    const heightFactor = Math.max(0, 1 - height / 100);
    return (moistureNoise * 0.5 + 0.5) * heightFactor;
  }

  /**
   * Calculate temperature
   */
  private calculateTemperature(x: number, z: number, height: number): number {
    const tempNoise = this.noise2D(x * 0.003 + 1000, z * 0.003 + 1000);
    // Higher areas are colder
    const heightFactor = 1 - height / 150;
    return (tempNoise * 0.5 + 0.5) * heightFactor;
  }

  /**
   * Calculate vegetation density
   */
  private calculateVegetationDensity(
    x: number,
    z: number,
    height: number,
    slope: number
  ): number {
    const vegNoise = this.noise2D(x * 0.02, z * 0.02);
    // Less vegetation on steep slopes and high altitudes
    const slopeFactor = Math.max(0, 1 - slope * 2);
    const heightFactor = height < 80 ? 1 : Math.max(0, 1 - (height - 80) / 50);
    return (vegNoise * 0.5 + 0.5) * slopeFactor * heightFactor;
  }

  /**
   * Calculate erosion effect
   */
  private calculateErosion(
    x: number,
    z: number,
    height: number,
    slope: number,
    curvature: number
  ): number {
    const erosion = this.erosionNoise(x * 0.01, z * 0.01);
    // More erosion on steep slopes and high curvature
    const erosionFactor = slope * curvature * 0.1;
    return Math.abs(erosion) * erosionFactor;
  }

  /**
   * Calculate approximate ambient occlusion
   */
  private calculateAO(index: number, vertices: Float32Array, resolution: number): number {
    // Sample surrounding vertices to estimate occlusion
    let ao = 1.0;
    const sampleRadius = 2;
    const x = index % resolution;
    const z = Math.floor(index / resolution);

    let heightSum = 0;
    let sampleCount = 0;

    for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
      for (let dz = -sampleRadius; dz <= sampleRadius; dz++) {
        if (dx === 0 && dz === 0) continue;

        const nx = x + dx;
        const nz = z + dz;

        if (nx >= 0 && nx < resolution && nz >= 0 && nz < resolution) {
          const neighborIndex = (nz * resolution + nx) * 3;
          if (neighborIndex + 2 < vertices.length) {
            heightSum += vertices[neighborIndex + 2];
            sampleCount++;
          }
        }
      }
    }

    if (sampleCount > 0) {
      const avgHeight = heightSum / sampleCount;
      const currentHeight = vertices[index * 3 + 2];
      // Points below average are more occluded
      ao = currentHeight < avgHeight ? 0.7 : 1.0;
    }

    return ao;
  }

  /**
   * Get height at specific world position (for collision/placement)
   */
  getHeightAt(x: number, z: number): number {
    return this.calculateAdvancedHeight(x, z);
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    console.log('[EnhancedTerrainGenerator] Disposed');
  }
}
