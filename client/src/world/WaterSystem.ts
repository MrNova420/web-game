import * as THREE from 'three';

export class WaterSystem {
  private waterMeshes = new Map<string, THREE.Mesh>();
  private scene: THREE.Scene;
  private waterLevel = 0; // Sea level
  private clock: THREE.Clock;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.clock = new THREE.Clock();
  }

  createWaterPlane(chunkX: number, chunkZ: number, chunkSize: number = 64) {
    const key = `${chunkX},${chunkZ}`;
    
    if (this.waterMeshes.has(key)) {
      return;
    }

    // Create water geometry
    const geometry = new THREE.PlaneGeometry(chunkSize, chunkSize, 32, 32);
    
    // Create water material with transparency and reflection-like appearance
    const material = new THREE.MeshStandardMaterial({
      color: 0x0077be,
      transparent: true,
      opacity: 0.6,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    const waterMesh = new THREE.Mesh(geometry, material);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.set(chunkX * chunkSize, this.waterLevel, chunkZ * chunkSize);
    waterMesh.receiveShadow = true;

    this.scene.add(waterMesh);
    this.waterMeshes.set(key, waterMesh);
  }

  removeWaterPlane(chunkX: number, chunkZ: number) {
    const key = `${chunkX},${chunkZ}`;
    const waterMesh = this.waterMeshes.get(key);
    
    if (waterMesh) {
      this.scene.remove(waterMesh);
      waterMesh.geometry.dispose();
      (waterMesh.material as THREE.Material).dispose();
      this.waterMeshes.delete(key);
    }
  }

  update(_deltaTime: number) {
    // Animate water waves
    const time = this.clock.getElapsedTime();
    
    this.waterMeshes.forEach((waterMesh) => {
      const geometry = waterMesh.geometry as THREE.PlaneGeometry;
      const positions = geometry.attributes.position.array;
      
      // Create wave effect
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        // Simple wave animation
        positions[i + 2] = Math.sin(x * 0.1 + time) * 0.3 + 
                          Math.cos(y * 0.1 + time * 0.7) * 0.2;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
    });
  }

  getWaterLevel(): number {
    return this.waterLevel;
  }

  setWaterLevel(level: number) {
    this.waterLevel = level;
    
    // Update existing water meshes to new level
    this.waterMeshes.forEach((waterMesh) => {
      waterMesh.position.y = level;
    });
  }
}
