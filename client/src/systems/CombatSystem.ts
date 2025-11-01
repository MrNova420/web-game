import * as THREE from 'three';

/**
 * Combat action types
 */
export type CombatAction = 'melee_attack' | 'ranged_attack' | 'spell_cast' | 'block' | 'dodge';

/**
 * Combat event
 */
export interface CombatEvent {
  attackerId: string;
  targetId: string;
  action: CombatAction;
  damage: number;
  isCritical: boolean;
  timestamp: number;
}

/**
 * CombatSystem - Manages combat interactions between entities
 * Handles damage calculation, hit detection, and combat animations
 */
export class CombatSystem {
  private combatLog: CombatEvent[] = [];
  private combatCooldowns = new Map<string, number>();
  private readonly ATTACK_COOLDOWN = 1.0; // seconds
  private readonly ATTACK_RANGE = 3.0; // units

  constructor() {
    console.log('CombatSystem initialized');
  }

  /**
   * Check if entity can attack
   */
  canAttack(attackerId: string): boolean {
    const cooldown = this.combatCooldowns.get(attackerId);
    if (cooldown && cooldown > Date.now()) {
      return false;
    }
    return true;
  }

  /**
   * Check if target is in range
   */
  isInRange(attackerPos: THREE.Vector3, targetPos: THREE.Vector3, range: number = this.ATTACK_RANGE): boolean {
    return attackerPos.distanceTo(targetPos) <= range;
  }

  /**
   * Perform melee attack
   */
  performMeleeAttack(
    attackerId: string,
    attackerPos: THREE.Vector3,
    attackerStats: { attackDamage: number; critChance: number; critDamage: number },
    targetId: string,
    targetPos: THREE.Vector3,
    targetStats: { defense: number }
  ): { success: boolean; damage?: number; isCritical?: boolean } {
    
    // Check cooldown
    if (!this.canAttack(attackerId)) {
      return { success: false };
    }

    // Check range
    if (!this.isInRange(attackerPos, targetPos)) {
      return { success: false };
    }

    // Calculate damage
    const baseDamage = attackerStats.attackDamage;
    const isCritical = Math.random() < attackerStats.critChance;
    const critMultiplier = isCritical ? attackerStats.critDamage : 1.0;
    const rawDamage = baseDamage * critMultiplier;
    const finalDamage = Math.max(1, rawDamage - targetStats.defense);

    // Set cooldown
    this.combatCooldowns.set(attackerId, Date.now() + (this.ATTACK_COOLDOWN * 1000));

    // Log combat event
    const event: CombatEvent = {
      attackerId,
      targetId,
      action: 'melee_attack',
      damage: finalDamage,
      isCritical,
      timestamp: Date.now()
    };
    this.combatLog.push(event);

    console.log(`${attackerId} attacked ${targetId} for ${finalDamage} damage${isCritical ? ' (CRITICAL!)' : ''}`);

    return { success: true, damage: finalDamage, isCritical };
  }

  /**
   * Perform ranged attack
   */
  performRangedAttack(
    attackerId: string,
    attackerPos: THREE.Vector3,
    attackerStats: { attackDamage: number; critChance: number; critDamage: number },
    targetId: string,
    targetPos: THREE.Vector3,
    targetStats: { defense: number }
  ): { success: boolean; damage?: number; isCritical?: boolean } {
    
    const RANGED_RANGE = 15.0;

    // Check cooldown
    if (!this.canAttack(attackerId)) {
      return { success: false };
    }

    // Check range
    if (!this.isInRange(attackerPos, targetPos, RANGED_RANGE)) {
      return { success: false };
    }

    // Calculate damage (ranged has 80% damage)
    const baseDamage = attackerStats.attackDamage * 0.8;
    const isCritical = Math.random() < attackerStats.critChance;
    const critMultiplier = isCritical ? attackerStats.critDamage : 1.0;
    const rawDamage = baseDamage * critMultiplier;
    const finalDamage = Math.max(1, rawDamage - targetStats.defense);

    // Set cooldown (ranged is faster)
    this.combatCooldowns.set(attackerId, Date.now() + (this.ATTACK_COOLDOWN * 0.8 * 1000));

    // Log combat event
    const event: CombatEvent = {
      attackerId,
      targetId,
      action: 'ranged_attack',
      damage: finalDamage,
      isCritical,
      timestamp: Date.now()
    };
    this.combatLog.push(event);

    console.log(`${attackerId} shot ${targetId} for ${finalDamage} damage${isCritical ? ' (CRITICAL!)' : ''}`);

    return { success: true, damage: finalDamage, isCritical };
  }

  /**
   * Perform spell cast
   */
  performSpellCast(
    attackerId: string,
    attackerPos: THREE.Vector3,
    attackerStats: { intelligence: number; critChance: number; critDamage: number },
    targetId: string,
    targetPos: THREE.Vector3,
    targetStats: { defense: number },
    manaCost: number
  ): { success: boolean; damage?: number; isCritical?: boolean } {
    
    const SPELL_RANGE = 20.0;

    // Check cooldown
    if (!this.canAttack(attackerId)) {
      return { success: false };
    }

    // Check range
    if (!this.isInRange(attackerPos, targetPos, SPELL_RANGE)) {
      return { success: false };
    }

    // Calculate damage (based on intelligence)
    const baseDamage = attackerStats.intelligence * 3;
    const isCritical = Math.random() < attackerStats.critChance;
    const critMultiplier = isCritical ? attackerStats.critDamage : 1.0;
    const rawDamage = baseDamage * critMultiplier;
    const finalDamage = Math.max(1, rawDamage - (targetStats.defense * 0.5)); // Spells bypass some defense

    // Set cooldown (spells are slower)
    this.combatCooldowns.set(attackerId, Date.now() + (this.ATTACK_COOLDOWN * 1.5 * 1000));

    // Log combat event
    const event: CombatEvent = {
      attackerId,
      targetId,
      action: 'spell_cast',
      damage: finalDamage,
      isCritical,
      timestamp: Date.now()
    };
    this.combatLog.push(event);

    console.log(`${attackerId} cast spell on ${targetId} for ${finalDamage} damage${isCritical ? ' (CRITICAL!)' : ''}`);

    return { success: true, damage: finalDamage, isCritical };
  }

  /**
   * Calculate area of effect damage
   */
  performAOEAttack(
    attackerId: string,
    centerPos: THREE.Vector3,
    radius: number,
    targets: Map<string, { position: THREE.Vector3; stats: { defense: number } }>,
    attackerStats: { attackDamage: number; critChance: number; critDamage: number }
  ): Map<string, { damage: number; isCritical: boolean }> {
    
    const results = new Map<string, { damage: number; isCritical: boolean }>();

    targets.forEach((target, targetId) => {
      const distance = centerPos.distanceTo(target.position);
      
      if (distance <= radius) {
        // Damage falls off with distance
        const falloff = 1.0 - (distance / radius) * 0.5; // 50% to 100% damage
        const baseDamage = attackerStats.attackDamage * falloff;
        const isCritical = Math.random() < attackerStats.critChance;
        const critMultiplier = isCritical ? attackerStats.critDamage : 1.0;
        const rawDamage = baseDamage * critMultiplier;
        const finalDamage = Math.max(1, rawDamage - target.stats.defense);

        results.set(targetId, { damage: finalDamage, isCritical });

        // Log event
        const event: CombatEvent = {
          attackerId,
          targetId,
          action: 'spell_cast',
          damage: finalDamage,
          isCritical,
          timestamp: Date.now()
        };
        this.combatLog.push(event);
      }
    });

    console.log(`${attackerId} performed AOE attack hitting ${results.size} targets`);
    return results;
  }

  /**
   * Update cooldowns
   */
  update(deltaTime: number) {
    // Cooldowns are handled with timestamps, no update needed
  }

  /**
   * Get recent combat log
   */
  getRecentCombatLog(limit: number = 10): CombatEvent[] {
    return this.combatLog.slice(-limit);
  }

  /**
   * Clear old combat logs
   */
  clearOldLogs(maxAge: number = 60000) {
    const cutoff = Date.now() - maxAge;
    this.combatLog = this.combatLog.filter(event => event.timestamp > cutoff);
  }

  /**
   * Get combat cooldown remaining
   */
  getCooldownRemaining(attackerId: string): number {
    const cooldown = this.combatCooldowns.get(attackerId);
    if (!cooldown) return 0;
    
    const remaining = cooldown - Date.now();
    return Math.max(0, remaining / 1000);
  }
}
