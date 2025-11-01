import * as THREE from 'three';

/**
 * Pooled object
 */
interface PooledObject {
  object: THREE.Object3D;
  inUse: boolean;
}

/**
 * AssetPool - Object pooling for better performance
 * Reuses objects instead of creating/destroying them
 */
export class AssetPool {
  private pools = new Map<string, PooledObject[]>();
  private maxPoolSize = 100;
  private totalObjects = 0;

  constructor() {
    console.log('AssetPool initialized');
  }

  /**
   * Get object from pool or create new one
   */
  acquire(poolName: string, createFn: () => THREE.Object3D): THREE.Object3D {
    let pool = this.pools.get(poolName);
    
    // Create pool if doesn't exist
    if (!pool) {
      pool = [];
      this.pools.set(poolName, pool);
    }

    // Find available object in pool
    for (const pooled of pool) {
      if (!pooled.inUse) {
        pooled.inUse = true;
        pooled.object.visible = true;
        return pooled.object;
      }
    }

    // Create new object if pool not full
    if (pool.length < this.maxPoolSize) {
      const object = createFn();
      pool.push({ object, inUse: true });
      this.totalObjects++;
      return object;
    }

    // Pool full, return first object
    console.warn(`Pool ${poolName} is full, reusing object`);
    const pooled = pool[0];
    pooled.inUse = true;
    pooled.object.visible = true;
    return pooled.object;
  }

  /**
   * Return object to pool
   */
  release(poolName: string, object: THREE.Object3D) {
    const pool = this.pools.get(poolName);
    if (!pool) return;

    for (const pooled of pool) {
      if (pooled.object === object) {
        pooled.inUse = false;
        pooled.object.visible = false;
        // Reset position
        pooled.object.position.set(0, -1000, 0);
        return;
      }
    }
  }

  /**
   * Clear specific pool
   */
  clearPool(poolName: string) {
    const pool = this.pools.get(poolName);
    if (!pool) return;

    // Dispose all objects
    pool.forEach(pooled => {
      pooled.object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });

    this.totalObjects -= pool.length;
    this.pools.delete(poolName);
  }

  /**
   * Clear all pools
   */
  clearAll() {
    this.pools.forEach((pool, name) => {
      this.clearPool(name);
    });
  }

  /**
   * Get pool statistics
   */
  getStats(): { [poolName: string]: { total: number; inUse: number; available: number } } {
    const stats: { [poolName: string]: { total: number; inUse: number; available: number } } = {};

    this.pools.forEach((pool, name) => {
      const inUse = pool.filter(p => p.inUse).length;
      stats[name] = {
        total: pool.length,
        inUse,
        available: pool.length - inUse
      };
    });

    return stats;
  }

  /**
   * Get total objects
   */
  getTotalObjects(): number {
    return this.totalObjects;
  }

  /**
   * Set max pool size
   */
  setMaxPoolSize(size: number) {
    this.maxPoolSize = size;
  }
}

/**
 * TextureCache - Caches loaded textures
 */
export class TextureCache {
  private cache = new Map<string, THREE.Texture>();
  private loader = new THREE.TextureLoader();

  /**
   * Load texture with caching
   */
  async load(path: string): Promise<THREE.Texture> {
    // Return cached texture if exists
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    // Load new texture
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (texture) => {
          this.cache.set(path, texture);
          resolve(texture);
        },
        undefined,
        reject
      );
    });
  }

  /**
   * Get cached texture
   */
  get(path: string): THREE.Texture | undefined {
    return this.cache.get(path);
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.forEach(texture => texture.dispose());
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }
}

/**
 * GeometryCache - Caches loaded geometries
 */
export class GeometryCache {
  private cache = new Map<string, THREE.BufferGeometry>();

  /**
   * Cache geometry
   */
  set(key: string, geometry: THREE.BufferGeometry) {
    this.cache.set(key, geometry);
  }

  /**
   * Get cached geometry
   */
  get(key: string): THREE.BufferGeometry | undefined {
    return this.cache.get(key);
  }

  /**
   * Check if cached
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.forEach(geometry => geometry.dispose());
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.cache.size;
  }
}
