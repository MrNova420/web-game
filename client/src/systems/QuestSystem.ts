import * as THREE from 'three';

/**
 * Quest definition
 */
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'gather' | 'kill' | 'explore' | 'craft' | 'talk';
  objectives: QuestObjective[];
  rewards: QuestReward[];
  status: 'available' | 'active' | 'completed' | 'failed';
  requiredLevel?: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'gather' | 'kill' | 'reach' | 'craft' | 'talk';
  target: string;
  current: number;
  required: number;
  completed: boolean;
}

export interface QuestReward {
  type: 'item' | 'exp' | 'gold';
  id?: string;  // For items
  amount: number;
}

/**
 * QuestSystem - Manages quests and objectives
 */
export class QuestSystem {
  private quests = new Map<string, Quest>();
  private playerQuests = new Map<string, Set<string>>(); // playerId -> Set of quest IDs
  private questLog = new Map<string, Quest[]>(); // playerId -> active quests

  constructor() {
    this.initializeQuests();
  }

  /**
   * Initialize some starter quests
   */
  private initializeQuests() {
    // Gather quest
    this.registerQuest({
      id: 'gather_wood',
      title: 'Gather Wood',
      description: 'Collect 10 pieces of wood from trees',
      type: 'gather',
      objectives: [{
        id: 'wood_obj',
        description: 'Gather wood',
        type: 'gather',
        target: 'wood',
        current: 0,
        required: 10,
        completed: false
      }],
      rewards: [
        { type: 'exp', amount: 50 },
        { type: 'gold', amount: 25 }
      ],
      status: 'available'
    });

    // Kill quest
    this.registerQuest({
      id: 'kill_skeletons',
      title: 'Skeleton Slayer',
      description: 'Defeat 5 skeleton minions',
      type: 'kill',
      objectives: [{
        id: 'skeleton_obj',
        description: 'Kill skeleton minions',
        type: 'kill',
        target: 'skeleton_minion',
        current: 0,
        required: 5,
        completed: false
      }],
      rewards: [
        { type: 'exp', amount: 100 },
        { type: 'gold', amount: 50 },
        { type: 'item', id: 'health_potion', amount: 3 }
      ],
      status: 'available',
      requiredLevel: 2
    });

    // Exploration quest
    this.registerQuest({
      id: 'explore_forest',
      title: 'Forest Explorer',
      description: 'Explore the mystical forest biome',
      type: 'explore',
      objectives: [{
        id: 'forest_obj',
        description: 'Reach the mystical forest',
        type: 'reach',
        target: 'mystical_forest',
        current: 0,
        required: 1,
        completed: false
      }],
      rewards: [
        { type: 'exp', amount: 75 }
      ],
      status: 'available'
    });

    console.log(`Initialized ${this.quests.size} quests`);
  }

  /**
   * Register a quest
   */
  private registerQuest(quest: Quest) {
    this.quests.set(quest.id, quest);
  }

  /**
   * Start quest for player
   */
  startQuest(playerId: string, questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.error('Quest not found:', questId);
      return false;
    }

    if (quest.status !== 'available') {
      console.warn('Quest not available:', questId);
      return false;
    }

    // Create quest instance for player
    const playerQuest = { ...quest, status: 'active' as const };
    
    // Initialize player quest log if needed
    if (!this.questLog.has(playerId)) {
      this.questLog.set(playerId, []);
    }
    
    const playerQuestLog = this.questLog.get(playerId)!;
    playerQuestLog.push(playerQuest);
    
    // Track player has this quest
    if (!this.playerQuests.has(playerId)) {
      this.playerQuests.set(playerId, new Set());
    }
    this.playerQuests.get(playerId)!.add(questId);
    
    console.log(`Player ${playerId} started quest: ${quest.title}`);
    return true;
  }

  /**
   * Update quest objective progress
   */
  updateObjective(playerId: string, questId: string, objectiveId: string, amount: number = 1) {
    const playerQuestLog = this.questLog.get(playerId);
    if (!playerQuestLog) return;

    const quest = playerQuestLog.find(q => q.id === questId);
    if (!quest) return;

    const objective = quest.objectives.find(o => o.id === objectiveId);
    if (!objective) return;

    objective.current = Math.min(objective.current + amount, objective.required);
    
    if (objective.current >= objective.required) {
      objective.completed = true;
      console.log(`Objective completed: ${objective.description}`);
      
      // Check if all objectives completed
      if (quest.objectives.every(o => o.completed)) {
        this.completeQuest(playerId, questId);
      }
    }
  }

  /**
   * Complete quest
   */
  private completeQuest(playerId: string, questId: string) {
    const playerQuestLog = this.questLog.get(playerId);
    if (!playerQuestLog) return;

    const questIndex = playerQuestLog.findIndex(q => q.id === questId);
    if (questIndex === -1) return;

    const quest = playerQuestLog[questIndex];
    quest.status = 'completed';
    
    console.log(`Quest completed: ${quest.title}`);
    console.log('Rewards:', quest.rewards);
    
    // Remove from active quests
    playerQuestLog.splice(questIndex, 1);
  }

  /**
   * Get player's active quests
   */
  getPlayerQuests(playerId: string): Quest[] {
    return this.questLog.get(playerId) || [];
  }

  /**
   * Get available quests
   */
  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === 'available');
  }

  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }
}
