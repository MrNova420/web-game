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
      
      // If no materials loaded, apply a default material
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && !child.material) {
          child.material = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            roughness: 0.8,
            metalness: 0.2
          });
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
