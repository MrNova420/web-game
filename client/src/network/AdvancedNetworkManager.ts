import * as THREE from 'three';
import { io, Socket } from 'socket.io-client';

/**
 * AdvancedNetworkManager - Professional multiplayer networking
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Networking Systems
 * Client prediction, server reconciliation, entity interpolation
 */

interface InputSnapshot {
  sequence: number;
  timestamp: number;
  input: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
    rotation: number;
  };
}

interface ServerState {
  timestamp: number;
  players: Map<string, PlayerState>;
  lastProcessedInput: number;
}

interface PlayerState {
  id: string;
  position: THREE.Vector3;
  rotation: number;
  velocity: THREE.Vector3;
  health: number;
  animation: string;
}

export class AdvancedNetworkManager {
  private socket: Socket | null = null;
  private isConnected = false;
  private playerId: string = '';
  
  // Client prediction
  private inputSequence = 0;
  private inputHistory: InputSnapshot[] = [];
  private lastProcessedInputSequence = 0;
  
  // Server reconciliation
  private serverStateHistory: ServerState[] = [];
  private reconciliationBuffer = 100; // ms
  
  // Entity interpolation
  private remotePlayers = new Map<string, PlayerState>();
  private interpolationDelay = 100; // ms
  
  // Network stats
  private ping = 0;
  private lastPingTime = 0;
  private packetsSent = 0;
  private packetsReceived = 0;
  
  // Update rate
  private updateRate = 20; // Updates per second
  private lastUpdateTime = 0;
  
  constructor() {
    console.log('[AdvancedNetworkManager] Initialized');
  }
  
  /**
   * Connect to server
   */
  connect(serverUrl: string, authToken?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl, {
        auth: authToken ? { token: authToken } : undefined,
        transports: ['websocket'],
        upgrade: false
      });
      
      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('[AdvancedNetworkManager] Connected to server');
        resolve();
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('[AdvancedNetworkManager] Connection error:', error);
        reject(error);
      });
      
      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('[AdvancedNetworkManager] Disconnected from server');
      });
      
      this.setupEventHandlers();
    });
  }
  
  /**
   * Setup network event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    // Player ID assignment
    this.socket.on('player_id', (id: string) => {
      this.playerId = id;
      console.log(`[AdvancedNetworkManager] Assigned player ID: ${id}`);
    });
    
    // Server state updates
    this.socket.on('state_update', (state: ServerState) => {
      this.packetsReceived++;
      this.handleServerState(state);
    });
    
    // Ping response
    this.socket.on('pong', (timestamp: number) => {
      this.ping = Date.now() - timestamp;
    });
    
    // Player joined
    this.socket.on('player_joined', (player: PlayerState) => {
      console.log(`[AdvancedNetworkManager] Player joined: ${player.id}`);
      this.remotePlayers.set(player.id, player);
    });
    
    // Player left
    this.socket.on('player_left', (playerId: string) => {
      console.log(`[AdvancedNetworkManager] Player left: ${playerId}`);
      this.remotePlayers.delete(playerId);
    });
  }
  
  /**
   * Send player input to server with client prediction
   */
  sendInput(input: InputSnapshot['input']): void {
    if (!this.socket || !this.isConnected) return;
    
    const snapshot: InputSnapshot = {
      sequence: this.inputSequence++,
      timestamp: Date.now(),
      input
    };
    
    // Store for reconciliation
    this.inputHistory.push(snapshot);
    if (this.inputHistory.length > 100) {
      this.inputHistory.shift();
    }
    
    // Send to server
    this.socket.emit('player_input', snapshot);
    this.packetsSent++;
  }
  
  /**
   * Handle server state update with reconciliation
   */
  private handleServerState(state: ServerState): void {
    // Store server state
    this.serverStateHistory.push(state);
    if (this.serverStateHistory.length > 60) {
      this.serverStateHistory.shift();
    }
    
    // Update last processed input
    if (state.lastProcessedInput > this.lastProcessedInputSequence) {
      this.lastProcessedInputSequence = state.lastProcessedInput;
      
      // Remove processed inputs from history
      this.inputHistory = this.inputHistory.filter(
        input => input.sequence > state.lastProcessedInput
      );
    }
    
    // Update remote players
    state.players.forEach((player, id) => {
      if (id !== this.playerId) {
        this.remotePlayers.set(id, player);
      }
    });
  }
  
  /**
   * Reconcile client prediction with server state
   */
  reconcilePosition(localPosition: THREE.Vector3): THREE.Vector3 {
    if (this.serverStateHistory.length === 0) {
      return localPosition;
    }
    
    const latestState = this.serverStateHistory[this.serverStateHistory.length - 1];
    const serverPlayer = latestState.players.get(this.playerId);
    
    if (!serverPlayer) return localPosition;
    
    // Check if position differs significantly
    const distanceToServer = localPosition.distanceTo(serverPlayer.position);
    
    if (distanceToServer > 0.5) {
      // Snap to server position and replay unprocessed inputs
      console.log(`[AdvancedNetworkManager] Reconciling position (diff: ${distanceToServer.toFixed(2)})`);
      
      // TODO: Replay inputs from lastProcessedInputSequence
      return serverPlayer.position.clone();
    }
    
    return localPosition;
  }
  
  /**
   * Get interpolated remote player positions
   */
  getInterpolatedPlayers(): Map<string, PlayerState> {
    const interpolatedPlayers = new Map<string, PlayerState>();
    const renderTime = Date.now() - this.interpolationDelay;
    
    this.remotePlayers.forEach((player, id) => {
      // Simple interpolation (would need state history for proper interpolation)
      interpolatedPlayers.set(id, player);
    });
    
    return interpolatedPlayers;
  }
  
  /**
   * Update network manager
   */
  update(deltaTime: number): void {
    const currentTime = Date.now();
    
    // Send ping
    if (currentTime - this.lastPingTime > 1000) {
      this.sendPing();
      this.lastPingTime = currentTime;
    }
  }
  
  /**
   * Send ping to measure latency
   */
  private sendPing(): void {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit('ping', Date.now());
  }
  
  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('[AdvancedNetworkManager] Disconnected');
    }
  }
  
  /**
   * Get network statistics
   */
  getStatistics(): {
    connected: boolean;
    playerId: string;
    ping: number;
    remotePlayers: number;
    packetsSent: number;
    packetsReceived: number;
  } {
    return {
      connected: this.isConnected,
      playerId: this.playerId,
      ping: this.ping,
      remotePlayers: this.remotePlayers.size,
      packetsSent: this.packetsSent,
      packetsReceived: this.packetsReceived
    };
  }
  
  /**
   * Get player ID
   */
  getPlayerId(): string {
    return this.playerId;
  }
  
  /**
   * Get remote players
   */
  getRemotePlayers(): Map<string, PlayerState> {
    return new Map(this.remotePlayers);
  }
  
  /**
   * Check if connected
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}
