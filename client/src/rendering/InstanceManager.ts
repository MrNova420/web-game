import * as THREE from 'three';

/**
 * InstanceManager - GPU instancing for thousands of objects
 * ENHANCEMENT: Efficient rendering of repeated objects
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 4.2
 */

export interface InstanceData {
  position: THREE.Vector3;
  rotation: THREE.Quaternion;
  scale: THREE.Vector3;
  index: number;
  visible: boolean;
  boundingSphere: THREE.Sphere;
}

export class InstanceManager {
  private instancedMesh: THREE.InstancedMesh;
  private instances: InstanceData[] = [];
  private maxInstances: number;
  private currentCount = 0;
  private modelName: string;

  // Matrix for transformations
  private matrix = new THREE.Matrix4();
  private tempQuaternion = new THREE.Quaternion();
  private tempEuler = new THREE.Euler();

  constructor(
    model: THREE.Mesh,
    maxCount: number,
    modelName: string = 'unknown'
  ) {
    this.modelName = modelName;
    this.maxInstances = maxCount;

    // Clone geometry and material
    const geometry = model.geometry.clone();
    const material = model.material instanceof Array ? model.material[0].clone() : model.material.clone();

    // Create instanced mesh
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    this.instancedMesh.frustumCulled = true;

    console.log(
      `[InstanceManager] Created for ${modelName} with max ${maxCount} instances`
    );
  }

  /**
   * Add instance with position, rotation, and scale
   */
  addInstance(
    position: THREE.Vector3,
    rotation: number | THREE.Quaternion,
    scale: number | THREE.Vector3
  ): boolean {
    if (this.currentCount >= this.maxInstances) {
      console.warn(`[InstanceManager] ${this.modelName}: Max instances reached`);
      return false;
    }

    // Convert rotation to quaternion
    let quaternion: THREE.Quaternion;
    if (typeof rotation === 'number') {
      this.tempEuler.set(0, rotation, 0);
      quaternion = new THREE.Quaternion().setFromEuler(this.tempEuler);
    } else {
      quaternion = rotation.clone();
    }

    // Convert scale to vector
    let scaleVec: THREE.Vector3;
    if (typeof scale === 'number') {
      scaleVec = new THREE.Vector3(scale, scale, scale);
    } else {
      scaleVec = scale.clone();
    }

    // Create instance data
    const instance: InstanceData = {
      position: position.clone(),
      rotation: quaternion,
      scale: scaleVec,
      index: this.currentCount,
      visible: true,
      boundingSphere: new THREE.Sphere(position, Math.max(scaleVec.x, scaleVec.y, scaleVec.z) * 2),
    };

    // Compose matrix
    this.matrix.compose(position, quaternion, scaleVec);

    // Set matrix for this instance
    this.instancedMesh.setMatrixAt(this.currentCount, this.matrix);

    // Store instance data
    this.instances.push(instance);
    this.currentCount++;

    return true;
  }

  /**
   * Add instance with full transform
   */
  addInstanceWithTransform(
    position: THREE.Vector3,
    rotation: THREE.Quaternion,
    scale: THREE.Vector3
  ): boolean {
    return this.addInstance(position, rotation, scale);
  }

  /**
   * Update instance transformation
   */
  updateInstance(
    index: number,
    position?: THREE.Vector3,
    rotation?: THREE.Quaternion,
    scale?: THREE.Vector3
  ): void {
    if (index < 0 || index >= this.currentCount) {
      console.warn(`[InstanceManager] Invalid index: ${index}`);
      return;
    }

    const instance = this.instances[index];

    // Update position
    if (position) {
      instance.position.copy(position);
      instance.boundingSphere.center.copy(position);
    }

    // Update rotation
    if (rotation) {
      instance.rotation.copy(rotation);
    }

    // Update scale
    if (scale) {
      instance.scale.copy(scale);
      const maxScale = Math.max(scale.x, scale.y, scale.z);
      instance.boundingSphere.radius = maxScale * 2;
    }

    // Recompose matrix
    this.matrix.compose(instance.position, instance.rotation, instance.scale);
    this.instancedMesh.setMatrixAt(index, this.matrix);
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Update all instances and apply LOD/culling
   */
  update(cameraPosition?: THREE.Vector3, frustum?: THREE.Frustum): void {
    if (!cameraPosition || !frustum) {
      // Just update matrix if no culling
      this.instancedMesh.instanceMatrix.needsUpdate = true;
      this.instancedMesh.count = this.currentCount;
      return;
    }

    // Update LOD and culling
    let visibleCount = 0;

    for (let i = 0; i < this.currentCount; i++) {
      const instance = this.instances[i];

      // Frustum culling
      if (!frustum.intersectsSphere(instance.boundingSphere)) {
        instance.visible = false;
        // Hide by scaling to zero
        this.matrix.makeScale(0, 0, 0);
        this.instancedMesh.setMatrixAt(i, this.matrix);
        continue;
      }

      instance.visible = true;
      visibleCount++;

      // Calculate distance for LOD
      const distance = instance.position.distanceTo(cameraPosition);

      // Apply distance-based scaling (simple LOD)
      let lodScale = 1.0;
      if (distance > 200) {
        lodScale = 0.5; // Reduce scale for distant objects
      } else if (distance > 100) {
        lodScale = 0.75;
      }

      // Apply LOD scale
      const finalScale = instance.scale.clone().multiplyScalar(lodScale);
      this.matrix.compose(instance.position, instance.rotation, finalScale);
      this.instancedMesh.setMatrixAt(i, this.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.count = this.currentCount;

    // Optional: Log culling statistics
    if (Math.random() < 0.01) {
      // Log 1% of frames
      console.log(
        `[InstanceManager] ${this.modelName}: ${visibleCount}/${this.currentCount} visible`
      );
    }
  }

  /**
   * Clear all instances
   */
  clear(): void {
    this.currentCount = 0;
    this.instances = [];
    this.instancedMesh.count = 0;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
    console.log(`[InstanceManager] ${this.modelName}: Cleared all instances`);
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
   * Get all instances
   */
  getAllInstances(): InstanceData[] {
    return [...this.instances];
  }

  /**
   * Set color for specific instance
   */
  setInstanceColor(index: number, color: THREE.Color): void {
    if (index < 0 || index >= this.currentCount) return;
    this.instancedMesh.setColorAt(index, color);
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.instancedMesh.geometry.dispose();
    if (this.instancedMesh.material instanceof Array) {
      this.instancedMesh.material.forEach((m) => m.dispose());
    } else {
      this.instancedMesh.material.dispose();
    }
    this.instances = [];
    console.log(`[InstanceManager] ${this.modelName}: Disposed`);
  }
}
