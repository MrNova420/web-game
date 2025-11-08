import * as THREE from 'three';

/**
 * AdvancedNPCAI - Professional NPC AI system
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD AI Systems
 * Behavior trees, pathfinding, and decision making
 */

type NPCState = 'idle' | 'wander' | 'patrol' | 'chase' | 'attack' | 'flee' | 'interact' | 'dead';

interface NPCBehavior {
  priority: number;
  condition: () => boolean;
  action: () => void;
  name: string;
}

interface NPCStats {
  health: number;
  maxHealth: number;
  speed: number;
  detectionRange: number;
  attackRange: number;
  fleeThreshold: number; // Health % to flee
  aggressiveness: number; // 0-1
}

export class AdvancedNPCAI {
  private npc: THREE.Object3D;
  private state: NPCState = 'idle';
  private stats: NPCStats;
  
  // Behavior system
  private behaviors: NPCBehavior[] = [];
  private currentBehavior: NPCBehavior | null = null;
  
  // Movement
  private targetPosition: THREE.Vector3 | null = null;
  private velocity = new THREE.Vector3();
  private patrolPoints: THREE.Vector3[] = [];
  private currentPatrolIndex = 0;
  
  // Targets
  private targetEntity: THREE.Object3D | null = null;
  private lastSeenPosition: THREE.Vector3 | null = null;
  
  // Timers
  private idleTime = 0;
  private wanderTimer = 0;
  private attackCooldown = 0;
  private decisionTimer = 0;
  
  // Constants
  private readonly DECISION_INTERVAL = 0.5; // Make decisions every 0.5s
  private readonly WANDER_INTERVAL = 3.0; // New wander destination every 3s
  private readonly ATTACK_COOLDOWN = 1.0; // 1 second between attacks
  
  constructor(npc: THREE.Object3D, stats?: Partial<NPCStats>) {
    this.npc = npc;
    
    // Default stats
    this.stats = {
      health: stats?.health || 100,
      maxHealth: stats?.maxHealth || 100,
      speed: stats?.speed || 5,
      detectionRange: stats?.detectionRange || 20,
      attackRange: stats?.attackRange || 2,
      fleeThreshold: stats?.fleeThreshold || 0.2,
      aggressiveness: stats?.aggressiveness || 0.5
    };
    
    this.setupDefaultBehaviors();
    
    console.log('[AdvancedNPCAI] Initialized for NPC');
  }
  
  /**
   * Setup default behavior tree
   */
  private setupDefaultBehaviors(): void {
    // Priority 1: Death
    this.addBehavior('death', 100, 
      () => this.stats.health <= 0,
      () => this.executeDeath()
    );
    
    // Priority 2: Flee when low health
    this.addBehavior('flee', 90,
      () => this.stats.health / this.stats.maxHealth < this.stats.fleeThreshold,
      () => this.executeFlee()
    );
    
    // Priority 3: Attack if in range
    this.addBehavior('attack', 80,
      () => this.targetEntity !== null && 
            this.npc.position.distanceTo(this.targetEntity.position) <= this.stats.attackRange &&
            this.attackCooldown <= 0,
      () => this.executeAttack()
    );
    
    // Priority 4: Chase target
    this.addBehavior('chase', 70,
      () => this.targetEntity !== null,
      () => this.executeChase()
    );
    
    // Priority 5: Patrol
    this.addBehavior('patrol', 50,
      () => this.patrolPoints.length > 0,
      () => this.executePatrol()
    );
    
    // Priority 6: Wander
    this.addBehavior('wander', 30,
      () => true,
      () => this.executeWander()
    );
    
    // Priority 7: Idle (fallback)
    this.addBehavior('idle', 10,
      () => true,
      () => this.executeIdle()
    );
  }
  
  /**
   * Add custom behavior
   */
  addBehavior(name: string, priority: number, condition: () => boolean, action: () => void): void {
    this.behaviors.push({ name, priority, condition, action });
    // Sort by priority (highest first)
    this.behaviors.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Update AI system
   */
  update(deltaTime: number, playerPosition?: THREE.Vector3, enemies?: THREE.Object3D[]): void {
    // Update timers
    this.decisionTimer += deltaTime;
    this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    
    // Make decisions periodically
    if (this.decisionTimer >= this.DECISION_INTERVAL) {
      this.decisionTimer = 0;
      this.makeDecision(playerPosition, enemies);
    }
    
    // Execute current behavior
    if (this.currentBehavior) {
      this.currentBehavior.action();
    }
    
    // Move towards target
    this.updateMovement(deltaTime);
  }
  
  /**
   * Decision making - select best behavior
   */
  private makeDecision(playerPosition?: THREE.Vector3, enemies?: THREE.Object3D[]): void {
    // Update target detection
    if (playerPosition) {
      const distanceToPlayer = this.npc.position.distanceTo(playerPosition);
      if (distanceToPlayer <= this.stats.detectionRange) {
        this.detectTarget(playerPosition);
      } else if (this.targetEntity) {
        // Lost sight of target
        this.lastSeenPosition = this.targetEntity.position.clone();
        this.targetEntity = null;
      }
    }
    
    // Find highest priority behavior whose condition is met
    for (const behavior of this.behaviors) {
      if (behavior.condition()) {
        if (this.currentBehavior !== behavior) {
          console.log(`[AdvancedNPCAI] Switching to: ${behavior.name}`);
          this.currentBehavior = behavior;
          this.state = behavior.name as NPCState;
        }
        break;
      }
    }
  }
  
  /**
   * Detect and track target
   */
  private detectTarget(targetPosition: THREE.Vector3): void {
    // Create pseudo object for target tracking
    if (!this.targetEntity) {
      this.targetEntity = new THREE.Object3D();
    }
    this.targetEntity.position.copy(targetPosition);
    this.lastSeenPosition = targetPosition.clone();
  }
  
  /**
   * BEHAVIOR: Idle
   */
  private executeIdle(): void {
    this.targetPosition = null;
    this.velocity.set(0, 0, 0);
  }
  
  /**
   * BEHAVIOR: Wander randomly
   */
  private executeWander(): void {
    this.wanderTimer += this.DECISION_INTERVAL;
    
    if (this.wanderTimer >= this.WANDER_INTERVAL || !this.targetPosition) {
      this.wanderTimer = 0;
      
      // Pick random point nearby
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 10;
      
      this.targetPosition = new THREE.Vector3(
        this.npc.position.x + Math.cos(angle) * distance,
        this.npc.position.y,
        this.npc.position.z + Math.sin(angle) * distance
      );
    }
  }
  
  /**
   * BEHAVIOR: Patrol waypoints
   */
  private executePatrol(): void {
    if (this.patrolPoints.length === 0) return;
    
    // Set target to current patrol point
    this.targetPosition = this.patrolPoints[this.currentPatrolIndex];
    
    // Check if reached patrol point
    const distance = this.npc.position.distanceTo(this.targetPosition);
    if (distance < 1) {
      // Move to next patrol point
      this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
  }
  
  /**
   * BEHAVIOR: Chase target
   */
  private executeChase(): void {
    if (this.targetEntity) {
      this.targetPosition = this.targetEntity.position.clone();
    } else if (this.lastSeenPosition) {
      this.targetPosition = this.lastSeenPosition;
    }
  }
  
  /**
   * BEHAVIOR: Attack target
   */
  private executeAttack(): void {
    if (!this.targetEntity) return;
    
    // Face target
    this.npc.lookAt(this.targetEntity.position);
    
    // Stop moving
    this.targetPosition = null;
    this.velocity.set(0, 0, 0);
    
    // Execute attack
    console.log('[AdvancedNPCAI] Executing attack!');
    this.attackCooldown = this.ATTACK_COOLDOWN;
    
    // TODO: Trigger attack animation and damage
  }
  
  /**
   * BEHAVIOR: Flee from threat
   */
  private executeFlee(): void {
    if (this.targetEntity) {
      // Run away from target
      const fleeDirection = new THREE.Vector3()
        .subVectors(this.npc.position, this.targetEntity.position)
        .normalize();
      
      this.targetPosition = this.npc.position.clone()
        .add(fleeDirection.multiplyScalar(20));
    }
  }
  
  /**
   * BEHAVIOR: Death
   */
  private executeDeath(): void {
    this.targetPosition = null;
    this.velocity.set(0, 0, 0);
    this.targetEntity = null;
    
    // TODO: Trigger death animation and cleanup
    console.log('[AdvancedNPCAI] NPC died');
  }
  
  /**
   * Update movement towards target
   */
  private updateMovement(deltaTime: number): void {
    if (!this.targetPosition) return;
    
    const direction = new THREE.Vector3()
      .subVectors(this.targetPosition, this.npc.position)
      .normalize();
    
    const distance = this.npc.position.distanceTo(this.targetPosition);
    
    if (distance > 0.5) {
      // Move towards target
      const speed = this.state === 'flee' ? this.stats.speed * 1.5 : this.stats.speed;
      this.velocity.copy(direction).multiplyScalar(speed * deltaTime);
      this.npc.position.add(this.velocity);
      
      // Face movement direction
      if (this.velocity.lengthSq() > 0.01) {
        const targetRotation = Math.atan2(direction.x, direction.z);
        this.npc.rotation.y = targetRotation;
      }
    }
  }
  
  /**
   * Set patrol route
   */
  setPatrolRoute(points: THREE.Vector3[]): void {
    this.patrolPoints = points;
    this.currentPatrolIndex = 0;
  }
  
  /**
   * Take damage
   */
  takeDamage(amount: number): void {
    this.stats.health = Math.max(0, this.stats.health - amount);
    console.log(`[AdvancedNPCAI] Took ${amount} damage. Health: ${this.stats.health}/${this.stats.maxHealth}`);
  }
  
  /**
   * Heal
   */
  heal(amount: number): void {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + amount);
  }
  
  /**
   * Get current state
   */
  getState(): NPCState {
    return this.state;
  }
  
  /**
   * Get stats
   */
  getStats(): NPCStats {
    return { ...this.stats };
  }
  
  /**
   * Check if alive
   */
  isAlive(): boolean {
    return this.stats.health > 0;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    state: NPCState;
    health: string;
    hasTarget: boolean;
    currentBehavior: string;
  } {
    return {
      state: this.state,
      health: `${this.stats.health}/${this.stats.maxHealth}`,
      hasTarget: this.targetEntity !== null,
      currentBehavior: this.currentBehavior?.name || 'none'
    };
  }
}
