import * as THREE from 'three';

/**
 * AdvancedInstanceManager - Professional GPU instancing system
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section U.3
 * Handles thousands of objects with single draw call
 */

interface InstanceData {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  visible: boolean;
  lodLevel: number;
}

export class AdvancedInstanceManager {
  private instancedMesh: THREE.InstancedMesh;
  private instances: InstanceData[] = [];
  private maxInstances: number;
  private currentCount = 0;
  private modelName: string;
  
  // LOD system
  private lodDistances = [50, 100, 200]; // Distance thresholds for LOD
  private lodMeshes: THREE.InstancedMesh[] = [];
  
  // Culling
  private frustum = new THREE.Frustum();
  private cameraMatrix = new THREE.Matrix4();
  
  // Matrices for transformations
  private matrix = new THREE.Matrix4();
  private tempPosition = new THREE.Vector3();
  private tempQuaternion = new THREE.Quaternion();
  private tempScale = new THREE.Vector3();
  
  constructor(
    model: THREE.Mesh | THREE.Object3D,
    maxCount: number,
    modelName: string = 'unknown'
  ) {
    this.modelName = modelName;
    this.maxInstances = maxCount;
    
    // Extract geometry and material
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material | THREE.Material[];
    
    if (model instanceof THREE.Mesh) {
      geometry = model.geometry;
      material = model.material;
    } else {
      // Find first mesh in object
      let mesh: THREE.Mesh | null = null;
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
          mesh = child;
        }
      });
      
      if (!mesh) {
        throw new Error(`[AdvancedInstanceManager] No mesh found in model ${modelName}`);
      }
      
      geometry = mesh.geometry;
      material = mesh.material;
    }
    
    // Clone for safety
    geometry = geometry.clone();
    material = Array.isArray(material) ? material[0].clone() : material.clone();
    
    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    this.instancedMesh.frustumCulled = false; // We handle culling manually
    this.instancedMesh.count = 0; // Start with 0 visible
    
    console.log(
      `[AdvancedInstanceManager] Created for ${modelName} (max: ${maxCount})`
    );
  }
  
  /**
   * Add instance with transform
   */
  addInstance(
    position: THREE.Vector3,
    rotation: THREE.Quaternion | number = new THREE.Quaternion(),
    scale: THREE.Vector3 | number = new THREE.Vector3(1, 1, 1)
  ): number {
    if (this.currentCount >= this.maxInstances) {
      console.warn(`[AdvancedInstanceManager] ${this.modelName}: Max instances reached`);
      return -1;
    }
    
    // Convert to proper types
    const rot = typeof rotation === 'number' 
      ? new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotation, 0))
      : rotation;
    
    const scl = typeof scale === 'number'
      ? new THREE.Vector3(scale, scale, scale)
      : scale;
    
    // Store instance data
    const instance: InstanceData = {
      position: position.clone(),
      rotation: rot.clone(),
      scale: scl.clone(),
      visible: true,
      lodLevel: 0
    };
    
    this.instances.push(instance);
    
    // Set matrix
    this.matrix.compose(position, rot, scl);
    this.instancedMesh.setMatrixAt(this.currentCount, this.matrix);
    
    const index = this.currentCount;
    this.currentCount++;
    this.instancedMesh.count = this.currentCount;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    
    return index;
  }
  
  /**
   * Update instance transform
   */
  updateInstance(
    index: number,
    position?: THREE.Vector3,
    rotation?: THREE.Quaternion,
    scale?: THREE.Vector3
  ): void {
    if (index < 0 || index >= this.currentCount) {
      console.warn(`[AdvancedInstanceManager] Invalid index: ${index}`);
      return;
    }
    
    const instance = this.instances[index];
    
    if (position) instance.position.copy(position);
    if (rotation) instance.rotation.copy(rotation);
    if (scale) instance.scale.copy(scale);
    
    // Update matrix
    this.matrix.compose(instance.position, instance.rotation, instance.scale);
    this.instancedMesh.setMatrixAt(index, this.matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }
  
  /**
   * ADVANCED: Update all instances with LOD and frustum culling
   */
  updateInstances(camera: THREE.Camera): void {
    // Update frustum for culling
    this.cameraMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.cameraMatrix);
    
    const cameraPos = camera.position;
    let visibleCount = 0;
    
    for (let i = 0; i < this.currentCount; i++) {
      const instance = this.instances[i];
      
      // Calculate distance to camera for LOD
      const distance = instance.position.distanceTo(cameraPos);
      
      // Determine LOD level
      let lodLevel = 0;
      for (let j = 0; j < this.lodDistances.length; j++) {
        if (distance > this.lodDistances[j]) {
          lodLevel = j + 1;
        }
      }
      instance.lodLevel = lodLevel;
      
      // Simple sphere culling
      const sphere = new THREE.Sphere(instance.position, instance.scale.length() * 2);
      const isVisible = this.frustum.intersectsSphere(sphere);
      instance.visible = isVisible;
      
      if (isVisible) {
        // Apply LOD scaling
        let scaleFactor = 1.0;
        if (distance > this.lodDistances[2]) {
          scaleFactor = 0.5; // Far: 50% scale
        } else if (distance > this.lodDistances[1]) {
          scaleFactor = 0.75; // Medium: 75% scale
        } else if (distance > this.lodDistances[0]) {
          scaleFactor = 0.9; // Near: 90% scale
        }
        
        this.tempScale.copy(instance.scale).multiplyScalar(scaleFactor);
        this.matrix.compose(instance.position, instance.rotation, this.tempScale);
        visibleCount++;
      } else {
        // Hide by scaling to zero
        this.tempScale.set(0, 0, 0);
        this.matrix.compose(instance.position, instance.rotation, this.tempScale);
      }
      
      this.instancedMesh.setMatrixAt(i, this.matrix);
    }
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    
    // Log culling stats occasionally
    if (Math.random() < 0.001) { // 0.1% of frames
      console.log(
        `[AdvancedInstanceManager] ${this.modelName}: ${visibleCount}/${this.currentCount} visible`
      );
    }
  }
  
  /**
   * Set color for specific instance
   */
  setInstanceColor(index: number, color: THREE.Color): void {
    if (index < 0 || index >= this.currentCount) return;
    
    if (!this.instancedMesh.instanceColor) {
      // Initialize instance colors
      const colors = new Float32Array(this.maxInstances * 3);
      for (let i = 0; i < this.maxInstances; i++) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      }
      this.instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    }
    
    this.instancedMesh.setColorAt(index, color);
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }
  
  /**
   * Get the instanced mesh
   */
  getMesh(): THREE.InstancedMesh {
    return this.instancedMesh;
  }
  
  /**
   * Get instance count
   */
  getCount(): number {
    return this.currentCount;
  }
  
  /**
   * Get max instances
   */
  getMaxInstances(): number {
    return this.maxInstances;
  }
  
  /**
   * Get instance data
   */
  getInstance(index: number): InstanceData | undefined {
    return this.instances[index];
  }
  
  /**
   * Clear all instances
   */
  clear(): void {
    this.currentCount = 0;
    this.instances = [];
    this.instancedMesh.count = 0;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    console.log(`[AdvancedInstanceManager] ${this.modelName}: Cleared`);
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    name: string;
    current: number;
    max: number;
    visible: number;
    drawCalls: number;
  } {
    const visible = this.instances.filter(i => i.visible).length;
    
    return {
      name: this.modelName,
      current: this.currentCount,
      max: this.maxInstances,
      visible,
      drawCalls: visible > 0 ? 1 : 0 // Instancing = 1 draw call
    };
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    this.instancedMesh.geometry.dispose();
    
    if (Array.isArray(this.instancedMesh.material)) {
      this.instancedMesh.material.forEach(m => m.dispose());
    } else {
      this.instancedMesh.material.dispose();
    }
    
    this.instances = [];
    console.log(`[AdvancedInstanceManager] ${this.modelName}: Disposed`);
  }
}
