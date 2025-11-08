import * as THREE from 'three';

/**
 * AdvancedChunkManager - Professional chunk streaming with LOD
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section U.2
 * Handles infinite world with dynamic chunk loading/unloading
 */

interface ChunkData {
  position: THREE.Vector2;
  mesh: THREE.Mesh;
  lodLevel: number;
  lastAccessed: number;
  loading: boolean;
  loaded: boolean;
  distanceToPlayer: number;
}

export class AdvancedChunkManager {
  private chunks = new Map<string, ChunkData>();
  private chunkSize: number;
  private viewDistance: number;
  private lodLevels = 4;
  
  // Player tracking
  private playerPosition = new THREE.Vector3();
  private lastPlayerChunk = new THREE.Vector2(-999, -999);
  
  // LOD distances
  private lodDistances = [1, 2, 4, 6]; // In chunks
  
  // Loading queue
  private loadQueue: THREE.Vector2[] = [];
  private maxConcurrentLoads = 4;
  private currentLoads = 0;
  
  // Chunk generation callback
  private generateChunkCallback: ((x: number, z: number, lodLevel: number) => Promise<THREE.Mesh>) | null = null;
  
  // Performance settings
  private maxChunks = 100; // Maximum chunks in memory
  private unloadDistance = 8; // Chunks to keep loaded (in chunk units)
  
  constructor(chunkSize: number = 64, viewDistance: number = 6) {
    this.chunkSize = chunkSize;
    this.viewDistance = viewDistance;
    console.log(`[AdvancedChunkManager] Initialized (size: ${chunkSize}, view: ${viewDistance} chunks)`);
  }
  
  /**
   * Set chunk generation callback
   */
  setChunkGenerator(callback: (x: number, z: number, lodLevel: number) => Promise<THREE.Mesh>): void {
    this.generateChunkCallback = callback;
  }
  
  /**
   * Update player position and load/unload chunks
   */
  update(playerPosition: THREE.Vector3, scene: THREE.Scene): void {
    this.playerPosition.copy(playerPosition);
    
    // Calculate player's chunk position
    const playerChunk = new THREE.Vector2(
      Math.floor(playerPosition.x / this.chunkSize),
      Math.floor(playerPosition.z / this.chunkSize)
    );
    
    // Only process if player moved to new chunk
    if (playerChunk.equals(this.lastPlayerChunk)) {
      this.updateChunkLODs();
      return;
    }
    
    this.lastPlayerChunk.copy(playerChunk);
    
    // Queue chunks to load
    this.queueChunksToLoad(playerChunk);
    
    // Unload distant chunks
    this.unloadDistantChunks(playerChunk, scene);
    
    // Update LOD levels
    this.updateChunkLODs();
    
    // Process load queue
    this.processLoadQueue(scene);
  }
  
  /**
   * Queue chunks around player for loading
   */
  private queueChunksToLoad(playerChunk: THREE.Vector2): void {
    const chunksToLoad: THREE.Vector2[] = [];
    
    // Spiral pattern from player outward
    for (let distance = 0; distance <= this.viewDistance; distance++) {
      for (let dx = -distance; dx <= distance; dx++) {
        for (let dz = -distance; dz <= distance; dz++) {
          // Only process chunks at current distance ring
          if (Math.abs(dx) < distance && Math.abs(dz) < distance) continue;
          
          const chunkPos = new THREE.Vector2(
            playerChunk.x + dx,
            playerChunk.y + dz
          );
          
          const key = this.getChunkKey(chunkPos.x, chunkPos.y);
          
          // Skip if already loaded or loading
          if (this.chunks.has(key)) {
            const chunk = this.chunks.get(key)!;
            if (chunk.loaded || chunk.loading) continue;
          }
          
          chunksToLoad.push(chunkPos);
        }
      }
    }
    
    // Add to queue (prioritize closer chunks)
    this.loadQueue.push(...chunksToLoad);
    
    // Sort by distance to player
    this.loadQueue.sort((a, b) => {
      const distA = a.distanceTo(playerChunk);
      const distB = b.distanceTo(playerChunk);
      return distA - distB;
    });
  }
  
  /**
   * Process load queue
   */
  private async processLoadQueue(scene: THREE.Scene): Promise<void> {
    while (this.loadQueue.length > 0 && this.currentLoads < this.maxConcurrentLoads) {
      const chunkPos = this.loadQueue.shift();
      if (!chunkPos) break;
      
      const key = this.getChunkKey(chunkPos.x, chunkPos.y);
      
      // Skip if already loaded/loading
      if (this.chunks.has(key)) continue;
      
      // Mark as loading
      this.chunks.set(key, {
        position: chunkPos,
        mesh: new THREE.Mesh(), // Placeholder
        lodLevel: this.calculateLODLevel(chunkPos),
        lastAccessed: Date.now(),
        loading: true,
        loaded: false,
        distanceToPlayer: 0
      });
      
      this.currentLoads++;
      
      // Load chunk async
      this.loadChunk(chunkPos, scene).then(() => {
        this.currentLoads--;
      });
    }
  }
  
  /**
   * Load a chunk
   */
  private async loadChunk(chunkPos: THREE.Vector2, scene: THREE.Scene): Promise<void> {
    if (!this.generateChunkCallback) {
      console.warn('[AdvancedChunkManager] No chunk generator set');
      return;
    }
    
    try {
      const key = this.getChunkKey(chunkPos.x, chunkPos.y);
      const lodLevel = this.calculateLODLevel(chunkPos);
      
      // Generate chunk
      const mesh = await this.generateChunkCallback(chunkPos.x, chunkPos.y, lodLevel);
      
      // Position chunk
      mesh.position.set(
        chunkPos.x * this.chunkSize,
        0,
        chunkPos.y * this.chunkSize
      );
      
      // Add to scene
      scene.add(mesh);
      
      // Update chunk data
      const chunkData = this.chunks.get(key);
      if (chunkData) {
        chunkData.mesh = mesh;
        chunkData.loaded = true;
        chunkData.loading = false;
        chunkData.lastAccessed = Date.now();
      }
      
      console.log(`[AdvancedChunkManager] Loaded chunk (${chunkPos.x}, ${chunkPos.y}) LOD ${lodLevel}`);
      
    } catch (error) {
      console.error(`[AdvancedChunkManager] Failed to load chunk (${chunkPos.x}, ${chunkPos.y}):`, error);
      this.chunks.delete(this.getChunkKey(chunkPos.x, chunkPos.y));
    }
  }
  
  /**
   * Unload distant chunks
   */
  private unloadDistantChunks(playerChunk: THREE.Vector2, scene: THREE.Scene): void {
    const chunksToRemove: string[] = [];
    
    this.chunks.forEach((chunk, key) => {
      const distance = chunk.position.distanceTo(playerChunk);
      chunk.distanceToPlayer = distance;
      
      // Unload if too far
      if (distance > this.unloadDistance) {
        chunksToRemove.push(key);
      }
    });
    
    // Remove chunks
    chunksToRemove.forEach(key => {
      const chunk = this.chunks.get(key);
      if (chunk && chunk.loaded) {
        scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (chunk.mesh.material instanceof Array) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
        this.chunks.delete(key);
        console.log(`[AdvancedChunkManager] Unloaded chunk ${key}`);
      }
    });
    
    // Limit total chunks
    if (this.chunks.size > this.maxChunks) {
      this.cleanupOldChunks(scene);
    }
  }
  
  /**
   * Cleanup oldest unused chunks
   */
  private cleanupOldChunks(scene: THREE.Scene): void {
    const chunks = Array.from(this.chunks.entries());
    
    // Sort by last accessed time
    chunks.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 20%
    const toRemove = Math.floor(this.maxChunks * 0.2);
    for (let i = 0; i < toRemove && i < chunks.length; i++) {
      const [key, chunk] = chunks[i];
      if (chunk.loaded) {
        scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (chunk.mesh.material instanceof Array) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
      }
      this.chunks.delete(key);
    }
    
    console.log(`[AdvancedChunkManager] Cleaned up ${toRemove} old chunks`);
  }
  
  /**
   * Update LOD levels for all chunks
   */
  private updateChunkLODs(): void {
    this.chunks.forEach(chunk => {
      if (!chunk.loaded) return;
      
      const newLOD = this.calculateLODLevel(chunk.position);
      if (newLOD !== chunk.lodLevel) {
        chunk.lodLevel = newLOD;
        // Could reload chunk with new LOD here if needed
      }
      
      chunk.lastAccessed = Date.now();
    });
  }
  
  /**
   * Calculate LOD level based on distance to player
   */
  private calculateLODLevel(chunkPos: THREE.Vector2): number {
    const playerChunk = new THREE.Vector2(
      Math.floor(this.playerPosition.x / this.chunkSize),
      Math.floor(this.playerPosition.z / this.chunkSize)
    );
    
    const distance = chunkPos.distanceTo(playerChunk);
    
    for (let i = 0; i < this.lodLevels; i++) {
      if (distance <= this.lodDistances[i]) {
        return i;
      }
    }
    
    return this.lodLevels - 1;
  }
  
  /**
   * Get chunk key
   */
  private getChunkKey(x: number, z: number): string {
    return `${x},${z}`;
  }
  
  /**
   * Get loaded chunks count
   */
  getLoadedChunksCount(): number {
    return Array.from(this.chunks.values()).filter(c => c.loaded).length;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    loaded: number;
    loading: number;
    total: number;
    queueSize: number;
  } {
    const loaded = Array.from(this.chunks.values()).filter(c => c.loaded).length;
    const loading = Array.from(this.chunks.values()).filter(c => c.loading).length;
    
    return {
      loaded,
      loading,
      total: this.chunks.size,
      queueSize: this.loadQueue.length
    };
  }
  
  /**
   * Clear all chunks
   */
  clearAll(scene: THREE.Scene): void {
    this.chunks.forEach(chunk => {
      if (chunk.loaded) {
        scene.remove(chunk.mesh);
        chunk.mesh.geometry.dispose();
        if (chunk.mesh.material instanceof Array) {
          chunk.mesh.material.forEach(m => m.dispose());
        } else {
          chunk.mesh.material.dispose();
        }
      }
    });
    
    this.chunks.clear();
    this.loadQueue = [];
    console.log('[AdvancedChunkManager] Cleared all chunks');
  }
}
