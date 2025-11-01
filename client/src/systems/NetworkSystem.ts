/**
 * Network message types
 */
export enum MessageType {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  PING = 'ping',
  PONG = 'pong',
  
  // Player actions
  PLAYER_MOVE = 'player_move',
  PLAYER_ACTION = 'player_action',
  PLAYER_SPAWN = 'player_spawn',
  PLAYER_DESPAWN = 'player_despawn',
  
  // Combat
  ATTACK = 'attack',
  DAMAGE = 'damage',
  DEATH = 'death',
  
  // World
  CHUNK_REQUEST = 'chunk_request',
  CHUNK_DATA = 'chunk_data',
  ENTITY_SPAWN = 'entity_spawn',
  ENTITY_UPDATE = 'entity_update',
  
  // Chat
  CHAT_MESSAGE = 'chat_message',
  
  // State sync
  STATE_SYNC = 'state_sync'
}

/**
 * Network message
 */
export interface NetworkMessage {
  type: MessageType;
  data: any;
  timestamp: number;
  senderId?: string;
}

/**
 * Player state for networking
 */
export interface NetworkPlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  health: number;
  maxHealth: number;
  level: number;
  username: string;
}

/**
 * NetworkSystem - Manages multiplayer networking
 * Note: This is a client-side stub. Actual implementation would connect to WebSocket server
 */
export class NetworkSystem {
  private connected = false;
  private playerId: string | null = null;
  private otherPlayers = new Map<string, NetworkPlayerState>();
  private messageQueue: NetworkMessage[] = [];
  private latency = 0;
  
  // Simulated network (would be WebSocket in production)
  private ws: WebSocket | null = null;

  constructor() {
    console.log('NetworkSystem initialized (local mode)');
  }

  /**
   * Connect to server
   */
  async connect(serverUrl: string, username: string): Promise<boolean> {
    try {
      console.log(`Attempting to connect to ${serverUrl}...`);
      
      // In production, this would establish WebSocket connection
      // For now, simulate connection
      this.playerId = `player_${Math.random().toString(36).substr(2, 9)}`;
      this.connected = true;
      
      console.log(`Connected as ${username} (${this.playerId})`);
      
      // Send spawn message
      this.sendMessage({
        type: MessageType.PLAYER_SPAWN,
        data: { username, playerId: this.playerId },
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to connect:', error);
      return false;
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    if (this.connected) {
      this.sendMessage({
        type: MessageType.PLAYER_DESPAWN,
        data: { playerId: this.playerId },
        timestamp: Date.now()
      });
      
      this.connected = false;
      this.playerId = null;
      this.otherPlayers.clear();
      
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      console.log('Disconnected from server');
    }
  }

  /**
   * Send message to server
   */
  sendMessage(message: NetworkMessage) {
    if (!this.connected) {
      console.warn('Cannot send message: not connected');
      return;
    }

    message.senderId = this.playerId || undefined;
    
    // In production, would send via WebSocket
    // For now, just log
    console.log('Sending message:', message.type);
    
    // Simulate network delay
    setTimeout(() => {
      this.messageQueue.push(message);
    }, 50);
  }

  /**
   * Send player position update
   */
  sendPlayerMove(position: { x: number; y: number; z: number }, rotation: { x: number; y: number; z: number }) {
    this.sendMessage({
      type: MessageType.PLAYER_MOVE,
      data: { position, rotation },
      timestamp: Date.now()
    });
  }

  /**
   * Send attack action
   */
  sendAttack(targetId: string, attackType: string, damage: number) {
    this.sendMessage({
      type: MessageType.ATTACK,
      data: { targetId, attackType, damage },
      timestamp: Date.now()
    });
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string) {
    this.sendMessage({
      type: MessageType.CHAT_MESSAGE,
      data: { message, username: 'Player' },
      timestamp: Date.now()
    });
  }

  /**
   * Request chunk data
   */
  requestChunk(chunkX: number, chunkZ: number) {
    this.sendMessage({
      type: MessageType.CHUNK_REQUEST,
      data: { chunkX, chunkZ },
      timestamp: Date.now()
    });
  }

  /**
   * Update other player state
   */
  updatePlayerState(playerId: string, state: NetworkPlayerState) {
    this.otherPlayers.set(playerId, state);
  }

  /**
   * Remove player
   */
  removePlayer(playerId: string) {
    this.otherPlayers.delete(playerId);
    console.log(`Player ${playerId} left the game`);
  }

  /**
   * Get all other players
   */
  getOtherPlayers(): Map<string, NetworkPlayerState> {
    return this.otherPlayers;
  }

  /**
   * Process incoming messages
   */
  update(deltaTime: number) {
    // Process message queue
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.handleMessage(message);
      }
    }

    // Send periodic state sync
    // In production, this would send less frequently
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: NetworkMessage) {
    switch (message.type) {
      case MessageType.PLAYER_SPAWN:
        console.log('Player spawned:', message.data);
        break;
        
      case MessageType.PLAYER_MOVE:
        if (message.senderId && message.senderId !== this.playerId) {
          const playerState = this.otherPlayers.get(message.senderId);
          if (playerState) {
            playerState.position = message.data.position;
            playerState.rotation = message.data.rotation;
          }
        }
        break;
        
      case MessageType.ATTACK:
        console.log('Attack received:', message.data);
        break;
        
      case MessageType.CHAT_MESSAGE:
        console.log(`[CHAT] ${message.data.username}: ${message.data.message}`);
        break;
        
      case MessageType.PONG:
        // Calculate latency
        this.latency = Date.now() - message.timestamp;
        break;
        
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get player ID
   */
  getPlayerId(): string | null {
    return this.playerId;
  }

  /**
   * Get latency
   */
  getLatency(): number {
    return this.latency;
  }

  /**
   * Send ping to measure latency
   */
  sendPing() {
    this.sendMessage({
      type: MessageType.PING,
      data: {},
      timestamp: Date.now()
    });
  }
}
