import * as THREE from 'three';
import { RealAssetTerrainGenerator } from './RealAssetTerrainGenerator';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * GrassSystem manages instanced grass rendering for optimal performance
 * Uses GPU instancing to render thousands of grass blades efficiently
 * Uses actual grass models from extracted_assets (NOT procedural geometry)
 */
export class GrassSystem {
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();
  private terrainGenerator: RealAssetTerrainGenerator;
  private assetLoader: AssetLoader;
  private grassGeometry: THREE.BufferGeometry | null = null;
  private grassMaterial: THREE.Material;
  private instancesPerChunk = 500; // Grass blades per chunk
  private dummy = new THREE.Object3D();
  private grassAssets = [
    '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Grass_Common_Short.obj',
    '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Grass_Wispy_Short.obj',
  ];
  private grassModelLoaded = false;

  constructor(terrainGenerator: RealAssetTerrainGenerator, assetLoader: AssetLoader) {
    this.terrainGenerator = terrainGenerator;
    this.assetLoader = assetLoader;
    
    // Create grass material
    this.grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a9d23,
      flatShading: true,
      side: THREE.DoubleSide
    });
    
    // Load grass model asynchronously
    this.loadGrassModel();
  }

  private async loadGrassModel() {
    try {
      // Load one of the grass models
      const grassModel = await this.assetLoader.loadModel(this.grassAssets[0]);
      
      // Extract geometry from the loaded model
      grassModel.traverse((child) => {
        if (child instanceof THREE.Mesh && !this.grassGeometry) {
          this.grassGeometry = child.geometry.clone();
        }
      });
      
      if (this.grassGeometry) {
        this.grassModelLoaded = true;
        console.log('Grass model loaded from assets');
      }
    } catch (error) {
      console.error('Failed to load grass model:', error);
      // Fallback to simple geometry if model fails to load
      this.grassGeometry = this.createFallbackGrassGeometry();
      this.grassModelLoaded = true;
    }
  }

  private createFallbackGrassGeometry(): THREE.BufferGeometry {
    // Only used as fallback if asset loading fails
    console.warn('Using fallback grass geometry');
    return new THREE.PlaneGeometry(0.1, 0.5, 1, 2);
  }

  /**
   * Populate a chunk with instanced grass
   */
  async populateChunk(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    
    if (this.instancedMeshes.has(key)) {
      return; // Already populated
    }

    // Wait for grass model to load
    if (!this.grassModelLoaded) {
      console.log('Waiting for grass model to load...');
      return;
    }

    if (!this.grassGeometry) {
      console.error('Grass geometry not available');
      return;
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
  update(deltaTime: number, windDirection?: THREE.Vector3, windStrength?: number) {
    // Wind animation can be added via shader if needed
    // For now, we keep grass static as we're using real models
  }

  /**
   * Cleanup resources
   */
  dispose() {
    if (this.grassGeometry) {
      this.grassGeometry.dispose();
    }
    if (this.grassMaterial) {
      this.grassMaterial.dispose();
    }
    this.instancedMeshes.forEach(mesh => mesh.dispose());
    this.instancedMeshes.clear();
  }
}
