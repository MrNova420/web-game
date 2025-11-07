import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { RealAssetTerrainGenerator } from './RealAssetTerrainGenerator';

/**
 * PERFORMANCE FIX: VegetationManager using GPU instancing
 * Load ONE model of each vegetation type, then COPY/INSTANCE it many times
 * NOT cloning - using InstancedMesh for performance
 */
export class VegetationManager {
  private assetLoader: AssetLoader;
  private terrainGenerator: RealAssetTerrainGenerator;
  private placedVegetation = new Map<string, THREE.Object3D[]>();
  
  // PERFORMANCE FIX: Instanced meshes for vegetation
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();
  private vegetationGeometries = new Map<string, THREE.BufferGeometry>();
  private vegetationMaterials = new Map<string, THREE.Material>();
  private instanceCounts = new Map<string, number>();
  private tempObject = new THREE.Object3D();
  
  private vegetationAssets = {
    trees: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_5.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/TwistedTree_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/TwistedTree_3.obj',
    ],
    bushes: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Bush_Common.obj',
    ],
    rocks: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_Medium_1.obj',
    ],
    plants: [
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Plant_1.obj',
      '/extracted_assets/Stylized_Nature_MegaKit/OBJ/Plant_7.obj',
    ]
  };

  constructor(assetLoader: AssetLoader, terrainGenerator: RealAssetTerrainGenerator) {
    this.assetLoader = assetLoader;
    this.terrainGenerator = terrainGenerator;
    console.log('[VegetationManager] PERFORMANCE FIX: Will use GPU instancing for vegetation');
  }

  /**
   * PERFORMANCE FIX: Pre-load all vegetation models and create instanced meshes
   */
  async preloadVegetationModels(scene: THREE.Scene): Promise<void> {
    console.log('[VegetationManager] Pre-loading vegetation models for instancing...');
    
    const allVegetationPaths = new Set<string>();
    
    // Collect all unique vegetation paths
    for (const category of Object.values(this.vegetationAssets)) {
      for (const path of category) {
        allVegetationPaths.add(path);
      }
    }
    
    // Load each unique model ONCE
    for (const vegPath of allVegetationPaths) {
      try {
        const model = await this.assetLoader.loadModel(vegPath);
        
        let geometry: THREE.BufferGeometry | null = null;
        let material: THREE.Material | null = null;
        
        model.traverse((child) => {
          if (child instanceof THREE.Mesh && !geometry) {
            geometry = child.geometry.clone();
            material = child.material instanceof Array ? child.material[0].clone() : child.material.clone();
            
            // RENDERING FIX: Ensure geometry has normals
            if (geometry && !geometry.attributes.normal) {
              geometry.computeVertexNormals();
            }
            
            // RENDERING FIX: Configure material for proper visibility
            if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
              material.side = THREE.DoubleSide; // Fix see-through issues
              material.flatShading = false; // Smooth shading
              material.needsUpdate = true;
            }
          }
        });
        
        if (geometry && material) {
          this.vegetationGeometries.set(vegPath, geometry);
          this.vegetationMaterials.set(vegPath, material);
          
          // Create instanced mesh - estimate max instances
          const maxInstances = 5000; // Per vegetation type across all chunks
          const instancedMesh = new THREE.InstancedMesh(geometry, material, maxInstances);
          instancedMesh.castShadow = true;
          instancedMesh.receiveShadow = true;
          instancedMesh.count = 0;
          
          scene.add(instancedMesh);
          this.instancedMeshes.set(vegPath, instancedMesh);
          this.instanceCounts.set(vegPath, 0);
          
          console.log(`[VegetationManager] Loaded and instanced: ${vegPath.split('/').pop()}`);
        }
      } catch (error) {
        console.warn(`[VegetationManager] Failed to load vegetation: ${vegPath}`, error);
      }
    }
    
    console.log(`[VegetationManager] Pre-loaded ${allVegetationPaths.size} vegetation models with instancing`);
  }

  /**
   * PERFORMANCE FIX: Populate chunk using INSTANCED vegetation
   */
  async populateChunk(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    
    // Don't populate if already done
    if (this.placedVegetation.has(key)) {
      return;
    }

    const vegetation: THREE.Object3D[] = [];
    const chunkSize = 64;
    const baseX = chunkX * chunkSize;
    const baseZ = chunkZ * chunkSize;

    // Get biome for this chunk
    const centerX = baseX + chunkSize / 2;
    const centerZ = baseZ + chunkSize / 2;
    const biome = this.terrainGenerator.getBiomeAt(centerX, centerZ);

    // Get vegetation density from biome system
    const biomeSystem = this.terrainGenerator.getBiomeSystem();
    const density = biomeSystem.getVegetationDensity(biome);
    
    const treeDensity = density.trees;
    const bushDensity = density.bushes;
    const rockDensity = density.rocks;

    // PERFORMANCE FIX: Place trees using instancing
    for (let i = 0; i < treeDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      const treeAsset = this.vegetationAssets.trees[Math.floor(Math.random() * this.vegetationAssets.trees.length)];
      const instancedMesh = this.instancedMeshes.get(treeAsset);
      
      if (instancedMesh) {
        this.tempObject.position.set(x, height, z);
        this.tempObject.rotation.y = Math.random() * Math.PI * 2;
        this.tempObject.scale.set(2, 2, 2);
        this.tempObject.updateMatrix();
        
        const currentCount = this.instanceCounts.get(treeAsset) || 0;
        instancedMesh.setMatrixAt(currentCount, this.tempObject.matrix);
        this.instanceCounts.set(treeAsset, currentCount + 1);
        instancedMesh.count = currentCount + 1;
        instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // PERFORMANCE FIX: Place bushes using instancing
    for (let i = 0; i < bushDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      const bushAsset = this.vegetationAssets.bushes[0];
      const instancedMesh = this.instancedMeshes.get(bushAsset);
      
      if (instancedMesh) {
        this.tempObject.position.set(x, height, z);
        this.tempObject.rotation.y = Math.random() * Math.PI * 2;
        this.tempObject.scale.set(1.5, 1.5, 1.5);
        this.tempObject.updateMatrix();
        
        const currentCount = this.instanceCounts.get(bushAsset) || 0;
        instancedMesh.setMatrixAt(currentCount, this.tempObject.matrix);
        this.instanceCounts.set(bushAsset, currentCount + 1);
        instancedMesh.count = currentCount + 1;
        instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    // PERFORMANCE FIX: Place rocks using instancing
    for (let i = 0; i < rockDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      const rockAsset = this.vegetationAssets.rocks[0];
      const instancedMesh = this.instancedMeshes.get(rockAsset);
      
      if (instancedMesh) {
        this.tempObject.position.set(x, height, z);
        this.tempObject.rotation.y = Math.random() * Math.PI * 2;
        this.tempObject.scale.set(1, 1, 1);
        this.tempObject.updateMatrix();
        
        const currentCount = this.instanceCounts.get(rockAsset) || 0;
        instancedMesh.setMatrixAt(currentCount, this.tempObject.matrix);
        this.instanceCounts.set(rockAsset, currentCount + 1);
        instancedMesh.count = currentCount + 1;
        instancedMesh.instanceMatrix.needsUpdate = true;
      }
    }

    this.placedVegetation.set(key, vegetation);
  }

  removeChunkVegetation(chunkX: number, chunkZ: number, scene: THREE.Scene) {
    const key = `${chunkX},${chunkZ}`;
    const vegetation = this.placedVegetation.get(key);
    
    if (vegetation) {
      vegetation.forEach(obj => {
        scene.remove(obj);
        // Dispose of geometry and materials
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.placedVegetation.delete(key);
    }
  }
}
