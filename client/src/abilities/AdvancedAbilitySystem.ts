import * as THREE from 'three';

/**
 * Advanced Ability System
 * 
 * Professional ability/skill system with:
 * - Cooldowns
 * - Resource costs (mana, stamina)
 * - Ability trees
 * - Combo system
 * - Visual effects
 * 
 * For MMO-grade combat system
 */

export interface Ability {
  id: string;
  name: string;
  description: string;
  icon: string;
  cooldown: number;
  lastUsed: number;
  manaCost: number;
  staminaCost: number;
  damage: number;
  range: number;
  aoeRadius: number;
  castTime: number;
  channelTime: number;
  effects: AbilityEffect[];
  requirements: {
    level: number;
    abilities: string[];
  };
}

export interface AbilityEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'knockback' | 'stun' | 'dot' | 'hot';
  value: number;
  duration: number;
  tickRate?: number;
}

export class AdvancedAbilitySystem {
  private abilities = new Map<string, Ability>();
  private activeAbilities = new Set<string>();
  private combos: ComboChain[] = [];
  private lastAbilityUsed: string | null = null;
  private comboWindow = 2000; // 2 seconds
  private lastAbilityTime = 0;
  
  constructor() {
    this.initializeDefaultAbilities();
  }
  
  private initializeDefaultAbilities(): void {
    // Basic attack
    this.addAbility({
      id: 'basic_attack',
      name: 'Basic Attack',
      description: 'A simple melee attack',
      icon: '/icons/sword.png',
      cooldown: 1000,
      lastUsed: 0,
      manaCost: 0,
      staminaCost: 5,
      damage: 10,
      range: 3,
      aoeRadius: 0,
      castTime: 0,
      channelTime: 0,
      effects: [{ type: 'damage', value: 10, duration: 0 }],
      requirements: { level: 1, abilities: [] }
    });
    
    // Fireball
    this.addAbility({
      id: 'fireball',
      name: 'Fireball',
      description: 'Launch a ball of fire',
      icon: '/icons/fireball.png',
      cooldown: 3000,
      lastUsed: 0,
      manaCost: 30,
      staminaCost: 0,
      damage: 50,
      range: 30,
      aoeRadius: 5,
      castTime: 1000,
      channelTime: 0,
      effects: [
        { type: 'damage', value: 50, duration: 0 },
        { type: 'dot', value: 5, duration: 5000, tickRate: 1000 }
      ],
      requirements: { level: 5, abilities: [] }
    });
    
    // Heal
    this.addAbility({
      id: 'heal',
      name: 'Healing Light',
      description: 'Restore health over time',
      icon: '/icons/heal.png',
      cooldown: 5000,
      lastUsed: 0,
      manaCost: 40,
      staminaCost: 0,
      damage: 0,
      range: 20,
      aoeRadius: 0,
      castTime: 500,
      channelTime: 0,
      effects: [
        { type: 'heal', value: 30, duration: 0 },
        { type: 'hot', value: 10, duration: 6000, tickRate: 1000 }
      ],
      requirements: { level: 3, abilities: [] }
    });
    
    // Dash
    this.addAbility({
      id: 'dash',
      name: 'Shadow Dash',
      description: 'Quickly dash forward',
      icon: '/icons/dash.png',
      cooldown: 8000,
      lastUsed: 0,
      manaCost: 20,
      staminaCost: 15,
      damage: 0,
      range: 15,
      aoeRadius: 0,
      castTime: 0,
      channelTime: 0,
      effects: [],
      requirements: { level: 7, abilities: [] }
    });
    
    // Shield
    this.addAbility({
      id: 'shield',
      name: 'Magic Shield',
      description: 'Absorb incoming damage',
      icon: '/icons/shield.png',
      cooldown: 15000,
      lastUsed: 0,
      manaCost: 50,
      staminaCost: 0,
      damage: 0,
      range: 0,
      aoeRadius: 0,
      castTime: 0,
      channelTime: 0,
      effects: [
        { type: 'buff', value: 100, duration: 10000 } // 100 shield
      ],
      requirements: { level: 10, abilities: [] }
    });
    
    // Stun
    this.addAbility({
      id: 'stun',
      name: 'Power Strike',
      description: 'Stun enemy briefly',
      icon: '/icons/stun.png',
      cooldown: 12000,
      lastUsed: 0,
      manaCost: 25,
      staminaCost: 20,
      damage: 30,
      range: 5,
      aoeRadius: 0,
      castTime: 500,
      channelTime: 0,
      effects: [
        { type: 'damage', value: 30, duration: 0 },
        { type: 'stun', value: 0, duration: 2000 }
      ],
      requirements: { level: 8, abilities: ['basic_attack'] }
    });
    
    // Setup combos
    this.combos = [
      {
        abilities: ['basic_attack', 'basic_attack', 'stun'],
        name: 'Triple Strike',
        bonusDamage: 50
      },
      {
        abilities: ['dash', 'fireball'],
        name: 'Blazing Rush',
        bonusDamage: 30
      }
    ];
    
    console.log(`✅ Initialized ${this.abilities.size} abilities`);
  }
  
  addAbility(ability: Ability): void {
    this.abilities.set(ability.id, ability);
  }
  
  useAbility(
    abilityId: string,
    playerMana: number,
    playerStamina: number,
    playerLevel: number
  ): {
    success: boolean;
    reason?: string;
    ability?: Ability;
    comboTriggered?: string;
  } {
    const ability = this.abilities.get(abilityId);
    
    if (!ability) {
      return { success: false, reason: 'Ability not found' };
    }
    
    // Check requirements
    if (playerLevel < ability.requirements.level) {
      return { success: false, reason: `Requires level ${ability.requirements.level}` };
    }
    
    // Check cooldown
    const now = Date.now();
    if (now - ability.lastUsed < ability.cooldown) {
      const remaining = Math.ceil((ability.cooldown - (now - ability.lastUsed)) / 1000);
      return { success: false, reason: `Cooldown: ${remaining}s` };
    }
    
    // Check resources
    if (playerMana < ability.manaCost) {
      return { success: false, reason: 'Not enough mana' };
    }
    
    if (playerStamina < ability.staminaCost) {
      return { success: false, reason: 'Not enough stamina' };
    }
    
    // Use ability
    ability.lastUsed = now;
    this.activeAbilities.add(abilityId);
    
    // Check for combo
    const combo = this.checkCombo(abilityId);
    
    this.lastAbilityUsed = abilityId;
    this.lastAbilityTime = now;
    
    return {
      success: true,
      ability,
      comboTriggered: combo
    };
  }
  
  private checkCombo(abilityId: string): string | undefined {
    const now = Date.now();
    
    // Check if within combo window
    if (now - this.lastAbilityTime > this.comboWindow) {
      return undefined;
    }
    
    // Check each combo
    for (const combo of this.combos) {
      // Simple combo check (last abilities match)
      if (this.lastAbilityUsed === combo.abilities[combo.abilities.length - 2] &&
          abilityId === combo.abilities[combo.abilities.length - 1]) {
        console.log(`🔥 Combo triggered: ${combo.name}`);
        return combo.name;
      }
    }
    
    return undefined;
  }
  
  getCooldown(abilityId: string): number {
    const ability = this.abilities.get(abilityId);
    if (!ability) return 0;
    
    const now = Date.now();
    const remaining = ability.cooldown - (now - ability.lastUsed);
    return Math.max(0, remaining);
  }
  
  getCooldownPercent(abilityId: string): number {
    const ability = this.abilities.get(abilityId);
    if (!ability) return 100;
    
    const remaining = this.getCooldown(abilityId);
    return (1 - remaining / ability.cooldown) * 100;
  }
  
  getAbility(abilityId: string): Ability | undefined {
    return this.abilities.get(abilityId);
  }
  
  getAllAbilities(): Ability[] {
    return Array.from(this.abilities.values());
  }
  
  getUnlockedAbilities(playerLevel: number, unlockedAbilities: string[]): Ability[] {
    return this.getAllAbilities().filter(ability => {
      if (ability.requirements.level > playerLevel) return false;
      if (ability.requirements.abilities.length === 0) return true;
      return ability.requirements.abilities.every(req => unlockedAbilities.includes(req));
    });
  }
  
  update(deltaTime: number): void {
    // Update active abilities (channeling, etc.)
    // This would handle ongoing effects
  }
  
  getStatistics(): {
    totalAbilities: number;
    activeAbilities: number;
    combos: number;
    lastAbility: string | null;
  } {
    return {
      totalAbilities: this.abilities.size,
      activeAbilities: this.activeAbilities.size,
      combos: this.combos.length,
      lastAbility: this.lastAbilityUsed
    };
  }
}

interface ComboChain {
  abilities: string[];
  name: string;
  bonusDamage: number;
}
