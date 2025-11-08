/**
 * Advanced Achievement System
 * 
 * Professional achievement tracking:
 * - Multiple categories
 * - Progress tracking
 * - Rewards (XP, gold, items, titles)
 * - Hidden achievements
 * - Achievement points
 * - Completion tracking
 * 
 * For comprehensive player progression
 */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  hidden: boolean;
  requirement: AchievementRequirement;
  rewards: AchievementReward[];
  points: number;
  unlocked: boolean;
  progress: number;
  unlockedAt?: number;
}

export type AchievementCategory = 
  | 'combat' 
  | 'exploration' 
  | 'crafting' 
  | 'social' 
  | 'quests' 
  | 'collection' 
  | 'special';

export interface AchievementRequirement {
  type: 'kill' | 'collect' | 'craft' | 'explore' | 'level' | 'gold' | 'quest' | 'custom';
  target: string;
  count: number;
}

export interface AchievementReward {
  type: 'xp' | 'gold' | 'item' | 'title' | 'cosmetic';
  value: number | string;
}

export class AdvancedAchievementSystem {
  private achievements = new Map<string, Achievement>();
  private unlockedAchievements = new Set<string>();
  private recentUnlocks: Achievement[] = [];
  private totalPoints = 0;
  
  constructor() {
    console.log('🏆 Initializing Advanced Achievement System...');
    this.initializeDefaultAchievements();
  }
  
  private initializeDefaultAchievements(): void {
    // Combat Achievements
    this.addAchievement({
      id: 'first_blood',
      name: 'First Blood',
      description: 'Defeat your first enemy',
      category: 'combat',
      icon: '/icons/achievements/first_blood.png',
      hidden: false,
      requirement: { type: 'kill', target: 'any', count: 1 },
      rewards: [
        { type: 'xp', value: 100 },
        { type: 'gold', value: 50 }
      ],
      points: 10,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'slayer',
      name: 'Slayer',
      description: 'Defeat 100 enemies',
      category: 'combat',
      icon: '/icons/achievements/slayer.png',
      hidden: false,
      requirement: { type: 'kill', target: 'any', count: 100 },
      rewards: [
        { type: 'xp', value: 1000 },
        { type: 'title', value: 'Slayer' }
      ],
      points: 50,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'dragon_slayer',
      name: 'Dragon Slayer',
      description: 'Defeat a dragon',
      category: 'combat',
      icon: '/icons/achievements/dragon.png',
      hidden: false,
      requirement: { type: 'kill', target: 'dragon', count: 1 },
      rewards: [
        { type: 'xp', value: 5000 },
        { type: 'gold', value: 1000 },
        { type: 'title', value: 'Dragon Slayer' }
      ],
      points: 100,
      unlocked: false,
      progress: 0
    });
    
    // Exploration Achievements
    this.addAchievement({
      id: 'explorer',
      name: 'Explorer',
      description: 'Discover 10 locations',
      category: 'exploration',
      icon: '/icons/achievements/explorer.png',
      hidden: false,
      requirement: { type: 'explore', target: 'location', count: 10 },
      rewards: [
        { type: 'xp', value: 500 }
      ],
      points: 25,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'world_traveler',
      name: 'World Traveler',
      description: 'Visit all major regions',
      category: 'exploration',
      icon: '/icons/achievements/traveler.png',
      hidden: false,
      requirement: { type: 'explore', target: 'region', count: 8 },
      rewards: [
        { type: 'xp', value: 2000 },
        { type: 'title', value: 'World Traveler' }
      ],
      points: 75,
      unlocked: false,
      progress: 0
    });
    
    // Crafting Achievements
    this.addAchievement({
      id: 'novice_crafter',
      name: 'Novice Crafter',
      description: 'Craft 10 items',
      category: 'crafting',
      icon: '/icons/achievements/craft.png',
      hidden: false,
      requirement: { type: 'craft', target: 'any', count: 10 },
      rewards: [
        { type: 'xp', value: 200 }
      ],
      points: 15,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'master_craftsman',
      name: 'Master Craftsman',
      description: 'Craft 1000 items',
      category: 'crafting',
      icon: '/icons/achievements/master_craft.png',
      hidden: false,
      requirement: { type: 'craft', target: 'any', count: 1000 },
      rewards: [
        { type: 'xp', value: 10000 },
        { type: 'title', value: 'Master Craftsman' }
      ],
      points: 150,
      unlocked: false,
      progress: 0
    });
    
    // Social Achievements
    this.addAchievement({
      id: 'socialite',
      name: 'Socialite',
      description: 'Have 10 friends',
      category: 'social',
      icon: '/icons/achievements/friend.png',
      hidden: false,
      requirement: { type: 'custom', target: 'friends', count: 10 },
      rewards: [
        { type: 'xp', value: 300 }
      ],
      points: 20,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'guild_founder',
      name: 'Guild Founder',
      description: 'Create a guild',
      category: 'social',
      icon: '/icons/achievements/guild.png',
      hidden: false,
      requirement: { type: 'custom', target: 'guild_create', count: 1 },
      rewards: [
        { type: 'xp', value: 1000 },
        { type: 'title', value: 'Guild Founder' }
      ],
      points: 50,
      unlocked: false,
      progress: 0
    });
    
    // Quest Achievements
    this.addAchievement({
      id: 'quest_starter',
      name: 'Quest Starter',
      description: 'Complete your first quest',
      category: 'quests',
      icon: '/icons/achievements/quest.png',
      hidden: false,
      requirement: { type: 'quest', target: 'any', count: 1 },
      rewards: [
        { type: 'xp', value: 100 }
      ],
      points: 10,
      unlocked: false,
      progress: 0
    });
    
    this.addAchievement({
      id: 'quest_master',
      name: 'Quest Master',
      description: 'Complete 100 quests',
      category: 'quests',
      icon: '/icons/achievements/quest_master.png',
      hidden: false,
      requirement: { type: 'quest', target: 'any', count: 100 },
      rewards: [
        { type: 'xp', value: 5000 },
        { type: 'title', value: 'Quest Master' }
      ],
      points: 100,
      unlocked: false,
      progress: 0
    });
    
    // Collection Achievements
    this.addAchievement({
      id: 'collector',
      name: 'Collector',
      description: 'Collect 50 unique items',
      category: 'collection',
      icon: '/icons/achievements/collect.png',
      hidden: false,
      requirement: { type: 'collect', target: 'unique', count: 50 },
      rewards: [
        { type: 'xp', value: 500 }
      ],
      points: 30,
      unlocked: false,
      progress: 0
    });
    
    // Special/Hidden Achievements
    this.addAchievement({
      id: 'secret_discovery',
      name: '???',
      description: 'A hidden secret awaits...',
      category: 'special',
      icon: '/icons/achievements/secret.png',
      hidden: true,
      requirement: { type: 'custom', target: 'secret_location', count: 1 },
      rewards: [
        { type: 'xp', value: 2000 },
        { type: 'gold', value: 500 }
      ],
      points: 75,
      unlocked: false,
      progress: 0
    });
    
    console.log(`✅ Initialized ${this.achievements.size} achievements`);
  }
  
  addAchievement(achievement: Achievement): void {
    this.achievements.set(achievement.id, achievement);
  }
  
  updateProgress(achievementId: string, progress: number): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return false;
    
    achievement.progress = Math.min(progress, achievement.requirement.count);
    
    // Check if completed
    if (achievement.progress >= achievement.requirement.count) {
      return this.unlockAchievement(achievementId);
    }
    
    return false;
  }
  
  incrementProgress(achievementId: string, amount: number = 1): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return false;
    
    return this.updateProgress(achievementId, achievement.progress + amount);
  }
  
  private unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || achievement.unlocked) return false;
    
    achievement.unlocked = true;
    achievement.unlockedAt = Date.now();
    this.unlockedAchievements.add(achievementId);
    this.recentUnlocks.push(achievement);
    this.totalPoints += achievement.points;
    
    // Keep only last 10 recent unlocks
    if (this.recentUnlocks.length > 10) {
      this.recentUnlocks.shift();
    }
    
    console.log(`🏆 Achievement Unlocked: ${achievement.name}!`);
    console.log(`   ${achievement.description}`);
    console.log(`   Rewards:`);
    achievement.rewards.forEach(reward => {
      console.log(`     +${reward.value} ${reward.type}`);
    });
    
    return true;
  }
  
  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.get(achievementId);
  }
  
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }
  
  getAchievementsByCategory(category: AchievementCategory): Achievement[] {
    return this.getAllAchievements().filter(a => a.category === category);
  }
  
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlocked);
  }
  
  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => !a.unlocked && !a.hidden);
  }
  
  getRecentUnlocks(limit: number = 5): Achievement[] {
    return this.recentUnlocks.slice(-limit);
  }
  
  getCompletionPercentage(): number {
    const total = this.achievements.size;
    const unlocked = this.unlockedAchievements.size;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }
  
  getCategoryCompletion(category: AchievementCategory): number {
    const categoryAchievements = this.getAchievementsByCategory(category);
    const unlocked = categoryAchievements.filter(a => a.unlocked).length;
    return categoryAchievements.length > 0 ? (unlocked / categoryAchievements.length) * 100 : 0;
  }
  
  getTotalPoints(): number {
    return this.totalPoints;
  }
  
  getMaxPoints(): number {
    return Array.from(this.achievements.values())
      .reduce((sum, a) => sum + a.points, 0);
  }
  
  getStatistics(): {
    total: number;
    unlocked: number;
    locked: number;
    hidden: number;
    points: number;
    maxPoints: number;
    completion: number;
    byCategory: Record<AchievementCategory, { total: number; unlocked: number }>;
  } {
    const byCategory: Record<AchievementCategory, { total: number; unlocked: number }> = {
      combat: { total: 0, unlocked: 0 },
      exploration: { total: 0, unlocked: 0 },
      crafting: { total: 0, unlocked: 0 },
      social: { total: 0, unlocked: 0 },
      quests: { total: 0, unlocked: 0 },
      collection: { total: 0, unlocked: 0 },
      special: { total: 0, unlocked: 0 }
    };
    
    this.getAllAchievements().forEach(achievement => {
      byCategory[achievement.category].total++;
      if (achievement.unlocked) {
        byCategory[achievement.category].unlocked++;
      }
    });
    
    return {
      total: this.achievements.size,
      unlocked: this.unlockedAchievements.size,
      locked: this.achievements.size - this.unlockedAchievements.size,
      hidden: this.getAllAchievements().filter(a => a.hidden && !a.unlocked).length,
      points: this.totalPoints,
      maxPoints: this.getMaxPoints(),
      completion: this.getCompletionPercentage(),
      byCategory
    };
  }
}
