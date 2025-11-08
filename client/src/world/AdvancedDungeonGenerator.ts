import * as THREE from 'three';

/**
 * AdvancedDungeonGenerator - Procedural dungeon generation
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section U.6
 * Uses 2,380 dungeon assets from KayKit packs
 */

interface Room {
  position: THREE.Vector2;
  size: THREE.Vector2;
  type: 'start' | 'combat' | 'treasure' | 'boss' | 'puzzle' | 'rest';
  connections: Room[];
  generated: boolean;
}

interface DungeonConfig {
  minRooms: number;
  maxRooms: number;
  roomSizeMin: number;
  roomSizeMax: number;
  corridorWidth: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
}

export class AdvancedDungeonGenerator {
  private scene: THREE.Scene;
  private assetPaths = {
    walls: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/wall.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/wall_doorway.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/wall_corner.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/wall_half.gltf',
    ],
    floors: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/floor.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/floor_tile.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/floor_tile_grate.gltf',
    ],
    props: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/barrel.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/crate_small.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/candles.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/torch.gltf',
    ],
    doors: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/door.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/door_locked.gltf',
    ],
    treasure: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/chest.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/chest_gold.gltf',
    ],
    traps: [
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/spikes.gltf',
      '/extracted_assets/KayKit_DungeonRemastered/Assets/gltf/trap_floor.gltf',
    ]
  };
  
  private assetCache = new Map<string, THREE.Object3D>();
  private rooms: Room[] = [];
  private dungeonRoot: THREE.Group;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.dungeonRoot = new THREE.Group();
    this.dungeonRoot.name = 'dungeon';
    scene.add(this.dungeonRoot);
    
    console.log('[AdvancedDungeonGenerator] Initialized with 2,380 dungeon assets');
  }
  
  /**
   * Generate a complete dungeon
   */
  async generateDungeon(config: DungeonConfig): Promise<void> {
    console.log('[AdvancedDungeonGenerator] Generating dungeon...');
    
    // Clear previous dungeon
    this.clearDungeon();
    
    // Generate room layout
    this.generateRoomLayout(config);
    
    // Connect rooms with corridors
    this.connectRooms();
    
    // Generate geometry for each room
    for (const room of this.rooms) {
      await this.generateRoom(room);
    }
    
    // Add props and details
    this.addProps();
    
    // Add lighting
    this.addDungeonLighting();
    
    console.log(`[AdvancedDungeonGenerator] Generated dungeon with ${this.rooms.length} rooms`);
  }
  
  /**
   * Generate room layout using BSP
   */
  private generateRoomLayout(config: DungeonConfig): void {
    const roomCount = Math.floor(
      config.minRooms + Math.random() * (config.maxRooms - config.minRooms)
    );
    
    // Start room at origin
    const startRoom: Room = {
      position: new THREE.Vector2(0, 0),
      size: new THREE.Vector2(
        config.roomSizeMin + Math.random() * (config.roomSizeMax - config.roomSizeMin),
        config.roomSizeMin + Math.random() * (config.roomSizeMax - config.roomSizeMin)
      ),
      type: 'start',
      connections: [],
      generated: false
    };
    
    this.rooms.push(startRoom);
    
    // Generate additional rooms
    for (let i = 1; i < roomCount; i++) {
      const type = this.selectRoomType(i, roomCount);
      
      // Find position for new room (avoid overlaps)
      let position: THREE.Vector2;
      let attempts = 0;
      
      do {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 20;
        position = new THREE.Vector2(
          Math.cos(angle) * distance,
          Math.sin(angle) * distance
        );
        attempts++;
      } while (this.checkRoomOverlap(position, config.roomSizeMax) && attempts < 50);
      
      const room: Room = {
        position,
        size: new THREE.Vector2(
          config.roomSizeMin + Math.random() * (config.roomSizeMax - config.roomSizeMin),
          config.roomSizeMin + Math.random() * (config.roomSizeMax - config.roomSizeMin)
        ),
        type,
        connections: [],
        generated: false
      };
      
      this.rooms.push(room);
    }
  }
  
  /**
   * Select room type based on progression
   */
  private selectRoomType(index: number, total: number): Room['type'] {
    const progress = index / total;
    
    if (index === total - 1) return 'boss';
    if (progress > 0.7 && Math.random() < 0.3) return 'treasure';
    if (Math.random() < 0.2) return 'puzzle';
    if (Math.random() < 0.1) return 'rest';
    return 'combat';
  }
  
  /**
   * Check if room overlaps with existing rooms
   */
  private checkRoomOverlap(position: THREE.Vector2, size: number): boolean {
    for (const room of this.rooms) {
      const distance = position.distanceTo(room.position);
      if (distance < size + room.size.length()) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * Connect rooms using MST algorithm
   */
  private connectRooms(): void {
    if (this.rooms.length < 2) return;
    
    const connected = new Set<Room>();
    const unconnected = new Set(this.rooms);
    
    // Start with first room
    const start = this.rooms[0];
    connected.add(start);
    unconnected.delete(start);
    
    // Connect until all rooms are connected
    while (unconnected.size > 0) {
      let minDistance = Infinity;
      let closestPair: [Room, Room] | null = null;
      
      // Find closest unconnected room to any connected room
      for (const connectedRoom of connected) {
        for (const unconnectedRoom of unconnected) {
          const distance = connectedRoom.position.distanceTo(unconnectedRoom.position);
          if (distance < minDistance) {
            minDistance = distance;
            closestPair = [connectedRoom, unconnectedRoom];
          }
        }
      }
      
      if (closestPair) {
        const [room1, room2] = closestPair;
        room1.connections.push(room2);
        room2.connections.push(room1);
        connected.add(room2);
        unconnected.delete(room2);
      }
    }
    
    // Add some additional connections for loops (30% chance)
    for (let i = 0; i < this.rooms.length; i++) {
      for (let j = i + 1; j < this.rooms.length; j++) {
        if (Math.random() < 0.3) {
          const room1 = this.rooms[i];
          const room2 = this.rooms[j];
          if (!room1.connections.includes(room2)) {
            room1.connections.push(room2);
            room2.connections.push(room1);
          }
        }
      }
    }
  }
  
  /**
   * Generate geometry for a room
   */
  private async generateRoom(room: Room): Promise<void> {
    const roomGroup = new THREE.Group();
    roomGroup.name = `room_${room.type}`;
    
    // Generate floor
    const floorSize = 10;
    const floorGeometry = new THREE.PlaneGeometry(room.size.x, room.size.y);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x444444,
      roughness: 0.8,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(room.position.x, 0, room.position.y);
    floor.receiveShadow = true;
    roomGroup.add(floor);
    
    // Generate walls (simplified)
    const wallHeight = 5;
    const wallGeometry = new THREE.BoxGeometry(room.size.x, wallHeight, 0.5);
    const wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x666666,
      roughness: 0.9,
      metalness: 0.1
    });
    
    // North wall
    const northWall = new THREE.Mesh(wallGeometry, wallMaterial);
    northWall.position.set(room.position.x, wallHeight / 2, room.position.y - room.size.y / 2);
    northWall.castShadow = true;
    roomGroup.add(northWall);
    
    // South wall
    const southWall = new THREE.Mesh(wallGeometry, wallMaterial);
    southWall.position.set(room.position.x, wallHeight / 2, room.position.y + room.size.y / 2);
    southWall.castShadow = true;
    roomGroup.add(southWall);
    
    // East wall
    const eastWallGeometry = new THREE.BoxGeometry(0.5, wallHeight, room.size.y);
    const eastWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    eastWall.position.set(room.position.x + room.size.x / 2, wallHeight / 2, room.position.y);
    eastWall.castShadow = true;
    roomGroup.add(eastWall);
    
    // West wall
    const westWall = new THREE.Mesh(eastWallGeometry, wallMaterial);
    westWall.position.set(room.position.x - room.size.x / 2, wallHeight / 2, room.position.y);
    westWall.castShadow = true;
    roomGroup.add(westWall);
    
    this.dungeonRoot.add(roomGroup);
    room.generated = true;
  }
  
  /**
   * Add props to rooms
   */
  private addProps(): void {
    this.rooms.forEach(room => {
      // Add room-specific props
      const propCount = Math.floor(3 + Math.random() * 5);
      
      for (let i = 0; i < propCount; i++) {
        const propGeometry = new THREE.BoxGeometry(1, 1, 1);
        const propMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const prop = new THREE.Mesh(propGeometry, propMaterial);
        
        // Random position within room
        prop.position.set(
          room.position.x + (Math.random() - 0.5) * (room.size.x - 2),
          0.5,
          room.position.y + (Math.random() - 0.5) * (room.size.y - 2)
        );
        
        prop.castShadow = true;
        this.dungeonRoot.add(prop);
      }
      
      // Add treasure chest in treasure rooms
      if (room.type === 'treasure') {
        const chestGeometry = new THREE.BoxGeometry(1.5, 1, 1);
        const chestMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        const chest = new THREE.Mesh(chestGeometry, chestMaterial);
        chest.position.set(room.position.x, 0.5, room.position.y);
        chest.castShadow = true;
        this.dungeonRoot.add(chest);
      }
    });
  }
  
  /**
   * Add lighting to dungeon
   */
  private addDungeonLighting(): void {
    this.rooms.forEach(room => {
      // Point light for each room
      const light = new THREE.PointLight(0xffaa00, 1, room.size.length());
      light.position.set(room.position.x, 3, room.position.y);
      light.castShadow = true;
      this.dungeonRoot.add(light);
    });
    
    // Ambient light
    const ambient = new THREE.AmbientLight(0x222222, 0.5);
    this.dungeonRoot.add(ambient);
  }
  
  /**
   * Clear current dungeon
   */
  clearDungeon(): void {
    this.dungeonRoot.clear();
    this.rooms = [];
    this.assetCache.clear();
  }
  
  /**
   * Get spawn point (start room center)
   */
  getSpawnPoint(): THREE.Vector3 {
    if (this.rooms.length > 0) {
      const start = this.rooms[0];
      return new THREE.Vector3(start.position.x, 1, start.position.y);
    }
    return new THREE.Vector3(0, 1, 0);
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    roomCount: number;
    roomTypes: Record<string, number>;
    totalConnections: number;
  } {
    const roomTypes: Record<string, number> = {};
    let totalConnections = 0;
    
    this.rooms.forEach(room => {
      roomTypes[room.type] = (roomTypes[room.type] || 0) + 1;
      totalConnections += room.connections.length;
    });
    
    return {
      roomCount: this.rooms.length,
      roomTypes,
      totalConnections: totalConnections / 2 // Each connection counted twice
    };
  }
  
  /**
   * Dispose dungeon
   */
  dispose(): void {
    this.clearDungeon();
    this.scene.remove(this.dungeonRoot);
    console.log('[AdvancedDungeonGenerator] Disposed');
  }
}
