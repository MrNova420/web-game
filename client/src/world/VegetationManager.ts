import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { TerrainGenerator } from './TerrainGenerator';

export class VegetationManager {
  private assetLoader: AssetLoader;
  private terrainGenerator: TerrainGenerator;
  private placedVegetation = new Map<string, THREE.Object3D[]>();
  
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

  constructor(assetLoader: AssetLoader, terrainGenerator: TerrainGenerator) {
    this.assetLoader = assetLoader;
    this.terrainGenerator = terrainGenerator;
  }

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

    // Determine vegetation density based on biome
    let treeDensity = 0;
    let bushDensity = 0;
    let rockDensity = 0;

    switch (biome) {
      case 'forest':
        treeDensity = 8;
        bushDensity = 12;
        rockDensity = 3;
        break;
      case 'plains':
        treeDensity = 2;
        bushDensity = 8;
        rockDensity = 4;
        break;
      case 'swamp':
        treeDensity = 5;
        bushDensity = 10;
        rockDensity = 2;
        break;
      case 'desert':
        treeDensity = 0;
        bushDensity = 1;
        rockDensity = 8;
        break;
      case 'tundra':
        treeDensity = 1;
        bushDensity = 2;
        rockDensity = 10;
        break;
    }

    // Place trees
    for (let i = 0; i < treeDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      try {
        const treeAsset = this.vegetationAssets.trees[Math.floor(Math.random() * this.vegetationAssets.trees.length)];
        const tree = await this.assetLoader.loadModel(treeAsset);
        tree.position.set(x, height, z);
        tree.scale.set(2, 2, 2); // Scale up trees
        scene.add(tree);
        vegetation.push(tree);
      } catch (error) {
        console.warn('Failed to load tree:', error);
      }
    }

    // Place bushes
    for (let i = 0; i < bushDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      try {
        const bush = await this.assetLoader.loadModel(this.vegetationAssets.bushes[0]);
        bush.position.set(x, height, z);
        bush.scale.set(1.5, 1.5, 1.5);
        scene.add(bush);
        vegetation.push(bush);
      } catch (error) {
        console.warn('Failed to load bush:', error);
      }
    }

    // Place rocks
    for (let i = 0; i < rockDensity; i++) {
      const x = baseX + Math.random() * chunkSize;
      const z = baseZ + Math.random() * chunkSize;
      const height = this.terrainGenerator.getHeight(x, z);
      
      try {
        const rock = await this.assetLoader.loadModel(this.vegetationAssets.rocks[0]);
        rock.position.set(x, height, z);
        rock.scale.set(1, 1, 1);
        scene.add(rock);
        vegetation.push(rock);
      } catch (error) {
        console.warn('Failed to load rock:', error);
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
