import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';

/**
 * GrassSystem manages instanced grass rendering for optimal performance
 * Uses GPU instancing to render thousands of grass blades efficiently
 */
export class GrassSystem {
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();
  private terrainGenerator: TerrainGenerator;
  private grassGeometry: THREE.BufferGeometry;
  private grassMaterial: THREE.Material;
  private instancesPerChunk = 500; // Grass blades per chunk
  private dummy = new THREE.Object3D();

  constructor(terrainGenerator: TerrainGenerator) {
    this.terrainGenerator = terrainGenerator;
    
    // Create a simple blade of grass geometry
    this.grassGeometry = this.createGrassBladeGeometry();
    
    // Create grass material with vertex colors for variety
    this.grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      flatShading: true,
      side: THREE.DoubleSide,
      vertexColors: true
    });
  }

  private createGrassBladeGeometry(): THREE.BufferGeometry {
    // Create a simple quad for grass blade
    const geometry = new THREE.PlaneGeometry(0.1, 0.5, 1, 2);
    
    // Bend the grass blade
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const bendFactor = y / 0.5; // More bend at top
      positions.setX(i, positions.getX(i) + bendFactor * 0.02);
    }
    
    // Add color variation
    const colors = new Float32Array(positions.count * 3);
    for (let i = 0; i < positions.count; i++) {
      const variation = 0.8 + Math.random() * 0.2;
      colors[i * 3] = 0.1 * variation;
      colors[i * 3 + 1] = 0.5 * variation;
      colors[i * 3 + 2] = 0.1 * variation;
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    return geometry;
  }

  /**
   * Populate a chunk with instanced grass
   */
  populateChunk(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    
    if (this.instancedMeshes.has(key)) {
      return; // Already populated
    }

    const chunkSize = 64;
    const baseX = chunkX * chunkSize;
    const baseZ = chunkZ * chunkSize;

    // Get biome to determine grass density
    const centerX = baseX + chunkSize / 2;
    const centerZ = baseZ + chunkSize / 2;
    const biome = this.terrainGenerator.getBiomeAt(centerX, centerZ);
    
    // Adjust grass count based on biome
    let grassCount = this.instancesPerChunk;
    const biomeSystem = this.terrainGenerator.getBiomeSystem();
    const grassDensity = biomeSystem.getGrassDensity(biome);
    grassCount = Math.floor(grassCount * grassDensity);

    if (grassCount === 0) {
      return; // No grass in this biome
    }

    // Create instanced mesh
    const instancedMesh = new THREE.InstancedMesh(
      this.grassGeometry,
      this.grassMaterial,
      grassCount
    );

    // Position each grass instance
    for (let i = 0; i < grassCount; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      // Random rotation around Y axis
      const rotationY = Math.random() * Math.PI * 2;
      
      // Slight random scale
      const scale = 0.8 + Math.random() * 0.4;
      
      this.dummy.position.set(x, height, z);
      this.dummy.rotation.set(0, rotationY, 0);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();
      
      instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);
    this.instancedMeshes.set(key, instancedMesh);
  }

  /**
   * Remove grass from a chunk
   */
  removeChunkGrass(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    const instancedMesh = this.instancedMeshes.get(key);
    
    if (instancedMesh) {
      scene.remove(instancedMesh);
      instancedMesh.dispose();
      this.instancedMeshes.delete(key);
    }
  }

  /**
   * Update grass animation (wind effect)
   */
  update(deltaTime: number, windStrength: number = 0.5) {
    // Wind animation could be done with a custom shader
    // For now, we keep it simple without animation
    // Future: Implement vertex shader for wind sway
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.grassGeometry.dispose();
    if (this.grassMaterial) {
      this.grassMaterial.dispose();
    }
    this.instancedMeshes.forEach(mesh => mesh.dispose());
    this.instancedMeshes.clear();
  }
}
