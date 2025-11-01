import * as THREE from 'three';

/**
 * LOD Level Configuration
 */
interface LODLevel {
  distance: number;
  detail: 'high' | 'medium' | 'low' | 'culled';
}

/**
 * LOD Object Configuration
 */
interface LODObject {
  object: THREE.Object3D;
  highDetail: THREE.Object3D;
  mediumDetail?: THREE.Object3D;
  lowDetail?: THREE.Object3D;
  billboard?: THREE.Sprite;
  currentDetail: string;
}

/**
 * LODManager - Level of Detail optimization system
 * Automatically switches mesh detail based on distance from camera
 */
export class LODManager {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private lodObjects: Map<string, LODObject> = new Map();
  
  // LOD distance thresholds
  private readonly LOD_LEVELS: LODLevel[] = [
    { distance: 0, detail: 'high' },
    { distance: 50, detail: 'medium' },
    { distance: 100, detail: 'low' },
    { distance: 200, detail: 'culled' }
  ];
  
  // Performance tracking
  private totalTriangles: number = 0;
  private visibleObjects: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
  }
  
  /**
   * Register object for LOD management
   */
  public registerObject(
    object: THREE.Object3D,
    highDetail: THREE.Object3D,
    mediumDetail?: THREE.Object3D,
    lowDetail?: THREE.Object3D
  ): void {
    const id = object.uuid;
    
    // Create billboard for very distant objects
    const billboard = this.createBillboard(object);
    
    this.lodObjects.set(id, {
      object,
      highDetail,
      mediumDetail,
      lowDetail,
      billboard,
      currentDetail: 'high'
    });
    
    // Start with high detail
    object.add(highDetail);
  }
  
  /**
   * Create billboard sprite for distant rendering
   */
  private createBillboard(object: THREE.Object3D): THREE.Sprite {
    // Create a simple sprite to represent distant objects
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    
    // Draw a simple colored square
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(2, 2, 1);
    sprite.visible = false;
    
    return sprite;
  }
  
  /**
   * Update LOD for all registered objects
   */
  public update(): void {
    this.totalTriangles = 0;
    this.visibleObjects = 0;
    
    const cameraPosition = this.camera.position;
    
    this.lodObjects.forEach((lodObj, id) => {
      const distance = cameraPosition.distanceTo(lodObj.object.position);
      
      // Determine LOD level based on distance
      const level = this.getLODLevel(distance);
      
      // Update object detail if changed
      if (lodObj.currentDetail !== level.detail) {
        this.switchDetail(lodObj, level.detail);
      }
      
      // Check frustum culling
      const inFrustum = this.isInFrustum(lodObj.object);
      
      if (!inFrustum) {
        lodObj.object.visible = false;
      } else {
        lodObj.object.visible = level.detail !== 'culled';
        if (lodObj.object.visible) {
          this.visibleObjects++;
          this.totalTriangles += this.countTriangles(lodObj.object);
        }
      }
    });
  }
  
  /**
   * Get LOD level for distance
   */
  private getLODLevel(distance: number): LODLevel {
    for (let i = this.LOD_LEVELS.length - 1; i >= 0; i--) {
      if (distance >= this.LOD_LEVELS[i].distance) {
        return this.LOD_LEVELS[i];
      }
    }
    return this.LOD_LEVELS[0];
  }
  
  /**
   * Switch object detail level
   */
  private switchDetail(lodObj: LODObject, detail: 'high' | 'medium' | 'low' | 'culled'): void {
    // Remove current detail
    lodObj.object.remove(lodObj.highDetail);
    if (lodObj.mediumDetail) lodObj.object.remove(lodObj.mediumDetail);
    if (lodObj.lowDetail) lodObj.object.remove(lodObj.lowDetail);
    if (lodObj.billboard) lodObj.object.remove(lodObj.billboard);
    
    // Hide all first
    lodObj.highDetail.visible = false;
    if (lodObj.mediumDetail) lodObj.mediumDetail.visible = false;
    if (lodObj.lowDetail) lodObj.lowDetail.visible = false;
    if (lodObj.billboard) lodObj.billboard.visible = false;
    
    // Add and show appropriate detail
    switch (detail) {
      case 'high':
        lodObj.object.add(lodObj.highDetail);
        lodObj.highDetail.visible = true;
        break;
      case 'medium':
        if (lodObj.mediumDetail) {
          lodObj.object.add(lodObj.mediumDetail);
          lodObj.mediumDetail.visible = true;
        } else {
          // Fallback to high if medium doesn't exist
          lodObj.object.add(lodObj.highDetail);
          lodObj.highDetail.visible = true;
        }
        break;
      case 'low':
        if (lodObj.lowDetail) {
          lodObj.object.add(lodObj.lowDetail);
          lodObj.lowDetail.visible = true;
        } else if (lodObj.billboard) {
          // Use billboard for low detail
          lodObj.object.add(lodObj.billboard);
          lodObj.billboard.visible = true;
        } else {
          // Fallback to high
          lodObj.object.add(lodObj.highDetail);
          lodObj.highDetail.visible = true;
        }
        break;
      case 'culled':
        // Nothing visible, object will be hidden
        break;
    }
    
    lodObj.currentDetail = detail;
  }
  
  /**
   * Check if object is in camera frustum
   */
  private isInFrustum(object: THREE.Object3D): boolean {
    if (!(this.camera instanceof THREE.PerspectiveCamera)) return true;
    
    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);
    
    // Get object bounding sphere
    const boundingSphere = new THREE.Sphere();
    if (object instanceof THREE.Mesh && object.geometry) {
      object.geometry.computeBoundingSphere();
      if (object.geometry.boundingSphere) {
        boundingSphere.copy(object.geometry.boundingSphere);
        boundingSphere.applyMatrix4(object.matrixWorld);
      }
    } else {
      // Approximate sphere for non-mesh objects
      boundingSphere.set(object.position, 5);
    }
    
    return frustum.intersectsSphere(boundingSphere);
  }
  
  /**
   * Count triangles in object
   */
  private countTriangles(object: THREE.Object3D): number {
    let count = 0;
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const geometry = child.geometry;
        if (geometry.index) {
          count += geometry.index.count / 3;
        } else if (geometry.attributes.position) {
          count += geometry.attributes.position.count / 3;
        }
      }
    });
    
    return count;
  }
  
  /**
   * Unregister object from LOD management
   */
  public unregisterObject(object: THREE.Object3D): void {
    this.lodObjects.delete(object.uuid);
  }
  
  /**
   * Get performance statistics
   */
  public getStats(): { visibleObjects: number; totalTriangles: number } {
    return {
      visibleObjects: this.visibleObjects,
      totalTriangles: Math.floor(this.totalTriangles)
    };
  }
  
  /**
   * Set custom LOD distances
   */
  public setLODDistances(high: number, medium: number, low: number): void {
    this.LOD_LEVELS[0].distance = 0;
    this.LOD_LEVELS[1].distance = high;
    this.LOD_LEVELS[2].distance = medium;
    this.LOD_LEVELS[3].distance = low;
  }
  
  /**
   * Clear all LOD objects
   */
  public clear(): void {
    this.lodObjects.clear();
  }
  
  /**
   * Cleanup
   */
  public dispose(): void {
    this.lodObjects.forEach((lodObj) => {
      if (lodObj.billboard) {
        lodObj.billboard.material.dispose();
        if (lodObj.billboard.material.map) {
          lodObj.billboard.material.map.dispose();
        }
      }
    });
    this.lodObjects.clear();
  }
}
