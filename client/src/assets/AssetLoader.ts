import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';

export class AssetLoader {
  private gltfLoader = new GLTFLoader();
  private objLoader = new OBJLoader();
  private mtlLoader = new MTLLoader();
  private textureLoader = new THREE.TextureLoader();
  private cache = new Map<string, any>();

  async loadModel(path: string): Promise<THREE.Object3D> {
    if (this.cache.has(path)) {
      return this.cache.get(path).clone();
    }

    const extension = path.split('.').pop()?.toLowerCase();
    let model: THREE.Object3D;

    if (extension === 'gltf' || extension === 'glb') {
      const gltf = await this.gltfLoader.loadAsync(path);
      model = gltf.scene;
      
      // RENDERING FIX: Ensure GLTF materials are properly configured
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Ensure materials have proper rendering settings
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(mat => {
            if (mat) {
              // Fix see-through issues with double-sided rendering
              mat.side = THREE.DoubleSide;
              mat.needsUpdate = true;
            }
          });
          
          // Enable shadows
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Ensure normals exist
          if (child.geometry && !child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });
    } else if (extension === 'obj') {
      // Try to load MTL file if it exists
      const mtlPath = path.replace('.obj', '.mtl');
      try {
        const materials = await this.mtlLoader.loadAsync(mtlPath);
        materials.preload();
        this.objLoader.setMaterials(materials);
      } catch (e) {
        // MTL file doesn't exist or failed to load, continue without materials
        console.warn(`[AssetLoader] Could not load MTL for ${path}, using default material`);
      }
      
      model = await this.objLoader.loadAsync(path);
      
      // RENDERING FIX: Apply proper default materials to all meshes
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // If mesh has no material or invalid material, apply default
          if (!child.material || (Array.isArray(child.material) && child.material.length === 0)) {
            child.material = new THREE.MeshStandardMaterial({ 
              color: 0x888888,
              roughness: 0.7,
              metalness: 0.2,
              side: THREE.DoubleSide, // Fix see-through issues
              flatShading: false
            });
          } else {
            // RENDERING FIX: Ensure existing materials are properly configured
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach(mat => {
              if (mat instanceof THREE.MeshBasicMaterial || mat instanceof THREE.MeshLambertMaterial) {
                // Convert basic materials to standard for better lighting
                const standardMat = new THREE.MeshStandardMaterial({
                  color: mat.color,
                  map: mat.map,
                  side: THREE.DoubleSide, // Fix see-through issues
                  roughness: 0.7,
                  metalness: 0.2
                });
                
                // Dispose old material to prevent memory leak
                mat.dispose();
                
                if (Array.isArray(child.material)) {
                  const idx = child.material.indexOf(mat);
                  if (idx >= 0) child.material[idx] = standardMat;
                } else {
                  child.material = standardMat;
                }
              } else if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                // Ensure double-sided rendering to fix see-through issues
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
              }
            });
          }
          
          // RENDERING FIX: Enable shadow casting and receiving
          child.castShadow = true;
          child.receiveShadow = true;
          
          // RENDERING FIX: Ensure geometry has proper normals
          if (child.geometry && !child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
      });
    } else {
      throw new Error(`Unsupported format: ${extension}`);
    }

    this.cache.set(path, model);
    return model.clone();
  }

  async loadTexture(path: string): Promise<THREE.Texture> {
    if (this.cache.has(path)) {
      return this.cache.get(path);
    }

    const texture = await this.textureLoader.loadAsync(path);
    this.cache.set(path, texture);
    return texture;
  }

  async loadTree(): Promise<THREE.Object3D> {
    return this.loadModel('../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj');
  }

  async preloadAssets(paths: string[]): Promise<void> {
    await Promise.all(paths.map(path => this.loadModel(path)));
  }
}
