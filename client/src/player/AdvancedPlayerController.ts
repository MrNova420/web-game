/**
 * Advanced Player Controller
 * Section 5.1 from AUTONOMOUS_DEVELOPMENT_GUIDE2.MD
 * 
 * AAA-grade player movement with:
 * - Multiple movement modes (walk, run, sprint, crouch, swim, climb)
 * - Physics-based movement with proper acceleration
 * - Stamina system
 * - Advanced collision detection
 * - Context-aware mode switching
 */

import * as THREE from 'three';

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  speed: number;
  jumpHeight: number;
}

export interface InputState {
  moveX: number;
  moveZ: number;
  jump: boolean;
  sprint: boolean;
  run: boolean;
  crouch: boolean;
}

export interface Collision {
  normal: THREE.Vector3;
  depth: number;
}

export type MovementMode = 'walk' | 'run' | 'sprint' | 'crouch' | 'swim' | 'climb';
export type PlayerState = 'idle' | 'walking' | 'running' | 'jumping' | 'falling' | 'swimming' | 'climbing';

export class AdvancedPlayerController {
  private player: THREE.Object3D;
  private world: any;
  private velocity = new THREE.Vector3();
  private isGrounded = false;
  private currentState: PlayerState = 'idle';
  
  // Movement modes with speed and stamina cost
  private movementModes = {
    walk: { speed: 5, stamina: 0 },
    run: { speed: 10, stamina: 0.1 },
    sprint: { speed: 15, stamina: 0.3 },
    crouch: { speed: 2, stamina: 0 },
    swim: { speed: 4, stamina: 0.2 },
    climb: { speed: 3, stamina: 0.15 }
  };
  
  private currentMode: MovementMode = 'walk';
  
  // Physics parameters
  private gravity = -20;
  private jumpStrength = 10;
  private acceleration = 30;
  private friction = 0.9;
  
  // Stamina system
  public stamina = 100;
  public maxStamina = 100;
  private staminaRegenRate = 10;
  
  // Collision detection
  private colliderRadius = 0.5;
  private colliderHeight = 1.8;
  private raycaster = new THREE.Raycaster();
  
  constructor(player: THREE.Object3D, world: any) {
    this.player = player;
    this.world = world;
  }
  
  update(deltaTime: number, inputState: InputState): void {
    this.updateMovementMode(inputState);
    this.updateVelocity(deltaTime, inputState);
    this.updatePosition(deltaTime);
    this.updateStamina(deltaTime);
    this.handleCollisions();
    this.updateState();
  }
  
  private updateMovementMode(input: InputState): void {
    // Context-aware mode switching
    if (this.isInWater()) {
      this.currentMode = 'swim';
      return;
    }
    
    if (this.isOnClimbableSurface()) {
      this.currentMode = 'climb';
      return;
    }
    
    // Input-based mode selection
    if (input.crouch) {
      this.currentMode = 'crouch';
    } else if (input.sprint && this.stamina > 10) {
      this.currentMode = 'sprint';
    } else if (input.run) {
      this.currentMode = 'run';
    } else {
      this.currentMode = 'walk';
    }
  }
  
  private updateVelocity(deltaTime: number, input: InputState): void {
    const mode = this.movementModes[this.currentMode];
    
    // Horizontal movement with acceleration
    const moveDirection = new THREE.Vector3(input.moveX, 0, input.moveZ);
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
    }
    
    if (moveDirection.length() > 0) {
      const targetVelocity = moveDirection.multiplyScalar(mode.speed);
      this.velocity.x += (targetVelocity.x - this.velocity.x) * this.acceleration * deltaTime;
      this.velocity.z += (targetVelocity.z - this.velocity.z) * this.acceleration * deltaTime;
    } else {
      // Apply friction when not moving
      this.velocity.x *= this.friction;
      this.velocity.z *= this.friction;
    }
    
    // Vertical movement (gravity and jumping)
    if (this.isGrounded) {
      if (input.jump && this.stamina > 5) {
        this.velocity.y = this.jumpStrength;
        this.stamina -= 5;
      } else if (this.velocity.y < 0) {
        this.velocity.y = 0;
      }
    } else {
      this.velocity.y += this.gravity * deltaTime;
    }
    
    // Stamina consumption for movement
    if (moveDirection.length() > 0) {
      this.stamina -= mode.stamina * deltaTime;
      this.stamina = Math.max(0, this.stamina);
    }
  }
  
  private updatePosition(deltaTime: number): void {
    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.player.position.add(movement);
  }
  
  private updateStamina(deltaTime: number): void {
    // Regenerate stamina when not sprinting/swimming
    if (this.currentMode !== 'sprint' && this.currentMode !== 'swim' && this.currentMode !== 'climb') {
      this.stamina += this.staminaRegenRate * deltaTime;
      this.stamina = Math.min(this.maxStamina, this.stamina);
    }
  }
  
  private handleCollisions(): void {
    const collisions = this.detectCollisions();
    
    for (const collision of collisions) {
      // Push player out of collision
      const pushOut = collision.normal.multiplyScalar(collision.depth);
      this.player.position.add(pushOut);
      
      // Cancel velocity in collision direction
      const velocityInNormal = this.velocity.dot(collision.normal);
      if (velocityInNormal < 0) {
        const correction = collision.normal.multiplyScalar(velocityInNormal);
        this.velocity.sub(correction);
      }
    }
  }
  
  private detectCollisions(): Collision[] {
    const collisions: Collision[] = [];
    
    // Ground check (downward raycast)
    this.raycaster.set(this.player.position, new THREE.Vector3(0, -1, 0));
    const groundHits = this.raycaster.intersectObjects(this.world?.objects || []);
    this.isGrounded = groundHits.length > 0 && groundHits[0].distance < this.colliderHeight / 2 + 0.1;
    
    // Side collisions (8 directions around player)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
      this.raycaster.set(this.player.position, direction);
      
      const hits = this.raycaster.intersectObjects(this.world?.objects || []);
      if (hits.length > 0 && hits[0].distance < this.colliderRadius) {
        collisions.push({
          normal: direction.negate().normalize(),
          depth: this.colliderRadius - hits[0].distance
        });
      }
    }
    
    return collisions;
  }
  
  private updateState(): void {
    const horizontalSpeed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
    
    if (!this.isGrounded) {
      this.currentState = this.velocity.y > 0 ? 'jumping' : 'falling';
    } else if (this.currentMode === 'swim') {
      this.currentState = 'swimming';
    } else if (this.currentMode === 'climb') {
      this.currentState = 'climbing';
    } else if (horizontalSpeed > 0.1) {
      this.currentState = this.currentMode === 'sprint' || this.currentMode === 'run' ? 'running' : 'walking';
    } else {
      this.currentState = 'idle';
    }
  }
  
  // Context detection methods
  private isInWater(): boolean {
    // Check if player is in water body
    if (!this.world || !this.world.getWaterLevelAt) return false;
    return this.world.getWaterLevelAt(this.player.position) > this.player.position.y;
  }
  
  private isOnClimbableSurface(): boolean {
    // Check if touching climbable objects (ladders, vines, etc.)
    if (!this.world || !this.world.hasClimbableSurface) return false;
    return this.world.hasClimbableSurface(this.player.position);
  }
  
  // Public getters
  public getCurrentMode(): MovementMode {
    return this.currentMode;
  }
  
  public getCurrentState(): PlayerState {
    return this.currentState;
  }
  
  public getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }
  
  public getIsGrounded(): boolean {
    return this.isGrounded;
  }
  
  public getStamina(): number {
    return this.stamina;
  }
  
  public getStatistics() {
    return {
      mode: this.currentMode,
      state: this.currentState,
      stamina: Math.round(this.stamina),
      maxStamina: this.maxStamina,
      isGrounded: this.isGrounded,
      velocity: {
        x: this.velocity.x.toFixed(2),
        y: this.velocity.y.toFixed(2),
        z: this.velocity.z.toFixed(2)
      },
      speed: Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2).toFixed(2)
    };
  }
}
