/**
 * Player stats definition
 */
export interface PlayerStats {
  // Core stats
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  stamina: number;
  maxStamina: number;
  
  // Attributes
  strength: number;
  dexterity: number;
  intelligence: number;
  vitality: number;
  
  // Progression
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Combat stats
  attackDamage: number;
  defense: number;
  critChance: number;
  critDamage: number;
  
  // Resource gathering
  miningSpeed: number;
  lumberjackSpeed: number;
  
  // Status
  isAlive: boolean;
}

/**
 * PlayerStatsSystem - Manages player stats and progression
 */
export class PlayerStatsSystem {
  private playerStats = new Map<string, PlayerStats>();

  constructor() {
    // Initialize with default stats
  }

  /**
   * Create stats for new player
   */
  createPlayerStats(playerId: string): PlayerStats {
    const stats: PlayerStats = {
      // Core stats
      health: 100,
      maxHealth: 100,
      mana: 50,
      maxMana: 50,
      stamina: 100,
      maxStamina: 100,
      
      // Attributes (starting at 10)
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      vitality: 10,
      
      // Progression
      level: 1,
      experience: 0,
      experienceToNext: 100,
      
      // Combat stats (calculated from attributes)
      attackDamage: 10,
      defense: 5,
      critChance: 0.05, // 5%
      critDamage: 1.5,  // 150%
      
      // Resource gathering
      miningSpeed: 1.0,
      lumberjackSpeed: 1.0,
      
      // Status
      isAlive: true
    };

    this.playerStats.set(playerId, stats);
    this.recalculateStats(playerId);
    
    console.log(`Created stats for player ${playerId}`);
    return stats;
  }

  /**
   * Recalculate derived stats from attributes
   */
  private recalculateStats(playerId: string) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    // Health from vitality
    stats.maxHealth = 100 + (stats.vitality * 10);
    
    // Mana from intelligence
    stats.maxMana = 50 + (stats.intelligence * 5);
    
    // Stamina from vitality
    stats.maxStamina = 100 + (stats.vitality * 5);
    
    // Attack damage from strength
    stats.attackDamage = 10 + (stats.strength * 2);
    
    // Defense from vitality
    stats.defense = 5 + (stats.vitality * 1.5);
    
    // Crit chance from dexterity
    stats.critChance = 0.05 + (stats.dexterity * 0.005); // 0.5% per point
    
    // Resource gathering speeds
    stats.miningSpeed = 1.0 + (stats.strength * 0.05);
    stats.lumberjackSpeed = 1.0 + (stats.strength * 0.05);
  }

  /**
   * Add experience
   */
  addExperience(playerId: string, amount: number) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.experience += amount;
    console.log(`Player gained ${amount} XP`);

    // Check for level up
    while (stats.experience >= stats.experienceToNext) {
      this.levelUp(playerId);
    }
  }

  /**
   * Level up player
   */
  private levelUp(playerId: string) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.level++;
    stats.experience -= stats.experienceToNext;
    stats.experienceToNext = Math.floor(stats.experienceToNext * 1.5);
    
    // Attribute points on level up
    stats.strength += 1;
    stats.dexterity += 1;
    stats.intelligence += 1;
    stats.vitality += 1;
    
    // Recalculate stats
    this.recalculateStats(playerId);
    
    // Restore health/mana/stamina on level up
    stats.health = stats.maxHealth;
    stats.mana = stats.maxMana;
    stats.stamina = stats.maxStamina;
    
    console.log(`Player leveled up to ${stats.level}!`);
  }

  /**
   * Take damage
   */
  takeDamage(playerId: string, damage: number): boolean {
    const stats = this.playerStats.get(playerId);
    if (!stats || !stats.isAlive) return false;

    // Apply defense
    const finalDamage = Math.max(1, damage - stats.defense);
    stats.health -= finalDamage;
    
    console.log(`Player took ${finalDamage} damage. Health: ${stats.health}/${stats.maxHealth}`);

    if (stats.health <= 0) {
      stats.health = 0;
      stats.isAlive = false;
      console.log('Player died!');
      return true; // Player died
    }

    return false;
  }

  /**
   * Heal player
   */
  heal(playerId: string, amount: number) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.health = Math.min(stats.health + amount, stats.maxHealth);
    console.log(`Player healed ${amount}. Health: ${stats.health}/${stats.maxHealth}`);
  }

  /**
   * Restore mana
   */
  restoreMana(playerId: string, amount: number) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.mana = Math.min(stats.mana + amount, stats.maxMana);
  }

  /**
   * Use mana
   */
  useMana(playerId: string, amount: number): boolean {
    const stats = this.playerStats.get(playerId);
    if (!stats || stats.mana < amount) return false;

    stats.mana -= amount;
    return true;
  }

  /**
   * Restore stamina
   */
  restoreStamina(playerId: string, amount: number) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.stamina = Math.min(stats.stamina + amount, stats.maxStamina);
  }

  /**
   * Use stamina
   */
  useStamina(playerId: string, amount: number): boolean {
    const stats = this.playerStats.get(playerId);
    if (!stats || stats.stamina < amount) return false;

    stats.stamina -= amount;
    return true;
  }

  /**
   * Respawn player
   */
  respawn(playerId: string) {
    const stats = this.playerStats.get(playerId);
    if (!stats) return;

    stats.health = stats.maxHealth;
    stats.mana = stats.maxMana;
    stats.stamina = stats.maxStamina;
    stats.isAlive = true;
    
    console.log(`Player ${playerId} respawned`);
  }

  /**
   * Get player stats
   */
  getStats(playerId: string): PlayerStats | undefined {
    return this.playerStats.get(playerId);
  }

  /**
   * Update stats (regeneration tick)
   */
  update(playerId: string, deltaTime: number) {
    const stats = this.playerStats.get(playerId);
    if (!stats || !stats.isAlive) return;

    // Health regeneration (slow)
    if (stats.health < stats.maxHealth) {
      stats.health = Math.min(stats.health + (0.5 * deltaTime), stats.maxHealth);
    }

    // Mana regeneration
    if (stats.mana < stats.maxMana) {
      stats.mana = Math.min(stats.mana + (1.0 * deltaTime), stats.maxMana);
    }

    // Stamina regeneration (fast)
    if (stats.stamina < stats.maxStamina) {
      stats.stamina = Math.min(stats.stamina + (5.0 * deltaTime), stats.maxStamina);
    }
  }
}
