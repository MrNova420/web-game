/**
 * Achievement definition
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'combat' | 'exploration' | 'crafting' | 'social' | 'progression';
  icon?: string;
  requirement: {
    type: 'kill' | 'collect' | 'craft' | 'explore' | 'level' | 'quest';
    target: string;
    count: number;
  };
  reward: {
    type: 'title' | 'item' | 'xp' | 'cosmetic';
    value: string | number;
  };
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

/**
 * AchievementSystem - Manages player achievements and rewards
 */
export class AchievementSystem {
  private achievements = new Map<string, Achievement>();
  private playerAchievements = new Map<string, Set<string>>(); // playerId -> achievement IDs

  constructor() {
    this.initializeAchievements();
    console.log('AchievementSystem initialized');
  }

  /**
   * Initialize achievements
   */
  private initializeAchievements() {
    // Combat achievements
    this.registerAchievement({
      id: 'first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy',
      category: 'combat',
      requirement: { type: 'kill', target: 'any', count: 1 },
      reward: { type: 'xp', value: 50 },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'skeleton_slayer',
      name: 'Skeleton Slayer',
      description: 'Defeat 50 skeleton enemies',
      category: 'combat',
      requirement: { type: 'kill', target: 'skeleton', count: 50 },
      reward: { type: 'title', value: 'Skeleton Slayer' },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'warrior',
      name: 'Warrior',
      description: 'Defeat 100 enemies',
      category: 'combat',
      requirement: { type: 'kill', target: 'any', count: 100 },
      reward: { type: 'title', value: 'Warrior' },
      unlocked: false,
      progress: 0
    });

    // Exploration achievements
    this.registerAchievement({
      id: 'explorer',
      name: 'Explorer',
      description: 'Discover all biomes',
      category: 'exploration',
      requirement: { type: 'explore', target: 'biomes', count: 6 },
      reward: { type: 'xp', value: 200 },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'dungeon_delver',
      name: 'Dungeon Delver',
      description: 'Explore 5 dungeons',
      category: 'exploration',
      requirement: { type: 'explore', target: 'dungeon', count: 5 },
      reward: { type: 'title', value: 'Dungeon Delver' },
      unlocked: false,
      progress: 0
    });

    // Crafting achievements
    this.registerAchievement({
      id: 'novice_crafter',
      name: 'Novice Crafter',
      description: 'Craft 10 items',
      category: 'crafting',
      requirement: { type: 'craft', target: 'any', count: 10 },
      reward: { type: 'xp', value: 100 },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'master_crafter',
      name: 'Master Crafter',
      description: 'Craft 100 items',
      category: 'crafting',
      requirement: { type: 'craft', target: 'any', count: 100 },
      reward: { type: 'title', value: 'Master Crafter' },
      unlocked: false,
      progress: 0
    });

    // Resource gathering achievements
    this.registerAchievement({
      id: 'lumberjack',
      name: 'Lumberjack',
      description: 'Collect 100 wood',
      category: 'crafting',
      requirement: { type: 'collect', target: 'wood', count: 100 },
      reward: { type: 'title', value: 'Lumberjack' },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'miner',
      name: 'Miner',
      description: 'Collect 100 stone',
      category: 'crafting',
      requirement: { type: 'collect', target: 'stone', count: 100 },
      reward: { type: 'title', value: 'Miner' },
      unlocked: false,
      progress: 0
    });

    // Progression achievements
    this.registerAchievement({
      id: 'level_10',
      name: 'Veteran',
      description: 'Reach level 10',
      category: 'progression',
      requirement: { type: 'level', target: 'level', count: 10 },
      reward: { type: 'xp', value: 500 },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'level_25',
      name: 'Hero',
      description: 'Reach level 25',
      category: 'progression',
      requirement: { type: 'level', target: 'level', count: 25 },
      reward: { type: 'title', value: 'Hero' },
      unlocked: false,
      progress: 0
    });

    // Quest achievements
    this.registerAchievement({
      id: 'quest_starter',
      name: 'Quest Starter',
      description: 'Complete 5 quests',
      category: 'social',
      requirement: { type: 'quest', target: 'complete', count: 5 },
      reward: { type: 'xp', value: 150 },
      unlocked: false,
      progress: 0
    });

    this.registerAchievement({
      id: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 50 quests',
      category: 'social',
      requirement: { type: 'quest', target: 'complete', count: 50 },
      reward: { type: 'title', value: 'Quest Master' },
      unlocked: false,
      progress: 0
    });

    console.log(`Initialized ${this.achievements.size} achievements`);
  }

  /**
   * Register achievement
   */
  private registerAchievement(achievement: Achievement) {
    this.achievements.set(achievement.id, achievement);
  }

  /**
   * Update achievement progress
   */
  updateProgress(
    playerId: string,
    type: string,
    target: string,
    amount: number = 1
  ): Achievement | null {
    // Find matching achievements
    const matchingAchievements = Array.from(this.achievements.values()).filter(
      achievement =>
        !achievement.unlocked &&
        achievement.requirement.type === type &&
        (achievement.requirement.target === target || achievement.requirement.target === 'any')
    );

    for (const achievement of matchingAchievements) {
      achievement.progress += amount;

      if (achievement.progress >= achievement.requirement.count) {
        return this.unlockAchievement(playerId, achievement.id);
      }
    }

    return null;
  }

  /**
   * Unlock achievement
   */
  private unlockAchievement(playerId: string, achievementId: string): Achievement | null {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) {
      return null;
    }

    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();

    // Track player achievements
    if (!this.playerAchievements.has(playerId)) {
      this.playerAchievements.set(playerId, new Set());
    }
    this.playerAchievements.get(playerId)!.add(achievementId);

    console.log(`🏆 Achievement Unlocked: ${achievement.name}`);
    console.log(`   ${achievement.description}`);

    return achievement;
  }

  /**
   * Get all achievements
   */
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory(category: string): Achievement[] {
    return Array.from(this.achievements.values()).filter(a => a.category === category);
  }

  /**
   * Get player achievements
   */
  getPlayerAchievements(playerId: string): Achievement[] {
    const achievementIds = this.playerAchievements.get(playerId);
    if (!achievementIds) return [];

    return Array.from(achievementIds)
      .map(id => this.achievements.get(id))
      .filter(a => a !== undefined) as Achievement[];
  }

  /**
   * Get achievement progress
   */
  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(playerId: string): number {
    const total = this.achievements.size;
    const unlocked = this.playerAchievements.get(playerId)?.size || 0;
    return (unlocked / total) * 100;
  }

  /**
   * Check for achievements
   */
  checkAchievements(playerId: string, eventType: string, eventData: { enemyType?: string; itemType?: string; amount?: number; newLevel?: number }): Achievement[] {
    const unlockedAchievements: Achievement[] = [];

    switch (eventType) {
      case 'enemy_killed': {
        const killAchievement = this.updateProgress(playerId, 'kill', eventData.enemyType);
        if (killAchievement) unlockedAchievements.push(killAchievement);
        
        const anyKillAchievement = this.updateProgress(playerId, 'kill', 'any');
        if (anyKillAchievement) unlockedAchievements.push(anyKillAchievement);
        break;
      }

      case 'item_collected': {
        const collectAchievement = this.updateProgress(playerId, 'collect', eventData.itemType, eventData.amount);
        if (collectAchievement) unlockedAchievements.push(collectAchievement);
        break;
      }

      case 'item_crafted': {
        const craftAchievement = this.updateProgress(playerId, 'craft', 'any');
        if (craftAchievement) unlockedAchievements.push(craftAchievement);
        break;
      }

      case 'level_up': {
        const levelAchievement = this.updateProgress(playerId, 'level', 'level', eventData.newLevel);
        if (levelAchievement) unlockedAchievements.push(levelAchievement);
        break;
      }

      case 'quest_completed': {
        const questAchievement = this.updateProgress(playerId, 'quest', 'complete');
        if (questAchievement) unlockedAchievements.push(questAchievement);
        break;
      }

      case 'biome_discovered': {
        const exploreAchievement = this.updateProgress(playerId, 'explore', 'biomes');
        if (exploreAchievement) unlockedAchievements.push(exploreAchievement);
        break;
      }

      case 'dungeon_entered': {
        const dungeonAchievement = this.updateProgress(playerId, 'explore', 'dungeon');
        if (dungeonAchievement) unlockedAchievements.push(dungeonAchievement);
        break;
      }
    }

    return unlockedAchievements;
  }
}
