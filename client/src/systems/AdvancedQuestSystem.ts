import * as THREE from 'three';

/**
 * AdvancedQuestSystem - Professional quest and mission system
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Quest Systems
 * Quest chains, objectives, rewards, and progression tracking
 */

type QuestStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed';
type ObjectiveType = 'kill' | 'collect' | 'interact' | 'explore' | 'escort' | 'deliver';

interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  target: string;
  current: number;
  required: number;
  completed: boolean;
  optional: boolean;
}

interface QuestReward {
  experience: number;
  gold: number;
  items: { id: string; quantity: number }[];
  reputation?: { faction: string; amount: number }[];
  unlockQuests?: string[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  questGiver: string;
  level: number;
  status: QuestStatus;
  objectives: QuestObjective[];
  rewards: QuestReward;
  prerequisites: string[];
  timeLimit?: number;
  repeatableAfter?: number;
  questChain?: string;
  isMainQuest: boolean;
}

export class AdvancedQuestSystem {
  private quests = new Map<string, Quest>();
  private activeQuests = new Map<string, Quest>();
  private completedQuests = new Set<string>();
  private questLog: Quest[] = [];
  
  // Callbacks
  private onQuestStarted: ((quest: Quest) => void) | null = null;
  private onQuestCompleted: ((quest: Quest) => void) | null = null;
  private onQuestFailed: ((quest: Quest) => void) | null = null;
  private onObjectiveUpdated: ((quest: Quest, objective: QuestObjective) => void) | null = null;
  
  constructor() {
    this.setupDefaultQuests();
    console.log('[AdvancedQuestSystem] Initialized');
  }
  
  /**
   * Setup default quest chains
   */
  private setupDefaultQuests(): void {
    // Tutorial quest chain
    this.addQuest({
      id: 'tutorial_welcome',
      title: 'Welcome to the World',
      description: 'Learn the basics of survival in this fantasy realm.',
      questGiver: 'Elder Guardian',
      level: 1,
      status: 'available',
      isMainQuest: true,
      questChain: 'tutorial',
      prerequisites: [],
      objectives: [
        {
          id: 'move_around',
          type: 'explore',
          description: 'Move around using WASD keys',
          target: 'movement',
          current: 0,
          required: 1,
          completed: false,
          optional: false
        },
        {
          id: 'collect_wood',
          type: 'collect',
          description: 'Collect 5 pieces of wood',
          target: 'wood',
          current: 0,
          required: 5,
          completed: false,
          optional: false
        }
      ],
      rewards: {
        experience: 100,
        gold: 50,
        items: [{ id: 'basic_axe', quantity: 1 }],
        unlockQuests: ['tutorial_combat']
      }
    });
    
    // Combat tutorial
    this.addQuest({
      id: 'tutorial_combat',
      title: 'First Blood',
      description: 'Learn to defend yourself against hostile creatures.',
      questGiver: 'Warrior Trainer',
      level: 1,
      status: 'locked',
      isMainQuest: true,
      questChain: 'tutorial',
      prerequisites: ['tutorial_welcome'],
      objectives: [
        {
          id: 'kill_skeletons',
          type: 'kill',
          description: 'Defeat 3 skeletons',
          target: 'skeleton',
          current: 0,
          required: 3,
          completed: false,
          optional: false
        }
      ],
      rewards: {
        experience: 150,
        gold: 75,
        items: [{ id: 'basic_sword', quantity: 1 }],
        unlockQuests: ['explore_dungeon']
      }
    });
    
    // Dungeon exploration
    this.addQuest({
      id: 'explore_dungeon',
      title: 'Into the Depths',
      description: 'Explore the ancient dungeon and discover its secrets.',
      questGiver: 'Elder Guardian',
      level: 3,
      status: 'locked',
      isMainQuest: true,
      questChain: 'main_story',
      prerequisites: ['tutorial_combat'],
      objectives: [
        {
          id: 'enter_dungeon',
          type: 'explore',
          description: 'Enter the ancient dungeon',
          target: 'dungeon_entrance',
          current: 0,
          required: 1,
          completed: false,
          optional: false
        },
        {
          id: 'find_treasure',
          type: 'interact',
          description: 'Find the hidden treasure room',
          target: 'treasure_chest',
          current: 0,
          required: 1,
          completed: false,
          optional: false
        },
        {
          id: 'defeat_boss',
          type: 'kill',
          description: 'Defeat the dungeon boss',
          target: 'dungeon_boss',
          current: 0,
          required: 1,
          completed: false,
          optional: false
        }
      ],
      rewards: {
        experience: 500,
        gold: 250,
        items: [
          { id: 'dungeon_key', quantity: 1 },
          { id: 'rare_gem', quantity: 3 }
        ],
        reputation: [{ faction: 'Town Guard', amount: 100 }]
      }
    });
    
    console.log('[AdvancedQuestSystem] Loaded 3 default quests');
  }
  
  /**
   * Add quest to system
   */
  addQuest(quest: Quest): void {
    this.quests.set(quest.id, quest);
    this.updateQuestAvailability();
  }
  
  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) {
      console.warn(`[AdvancedQuestSystem] Quest not found: ${questId}`);
      return false;
    }
    
    if (quest.status !== 'available') {
      console.warn(`[AdvancedQuestSystem] Quest not available: ${questId}`);
      return false;
    }
    
    // Check prerequisites
    if (!this.arePrerequisitesMet(quest)) {
      console.warn(`[AdvancedQuestSystem] Prerequisites not met for: ${questId}`);
      return false;
    }
    
    quest.status = 'active';
    this.activeQuests.set(questId, quest);
    this.questLog.push(quest);
    
    console.log(`[AdvancedQuestSystem] Started quest: ${quest.title}`);
    
    if (this.onQuestStarted) {
      this.onQuestStarted(quest);
    }
    
    return true;
  }
  
  /**
   * Update quest objective progress
   */
  updateObjective(questId: string, objectiveId: string, increment: number = 1): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;
    
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) return;
    
    objective.current = Math.min(objective.current + increment, objective.required);
    
    if (objective.current >= objective.required) {
      objective.completed = true;
      console.log(`[AdvancedQuestSystem] Objective completed: ${objective.description}`);
    }
    
    if (this.onObjectiveUpdated) {
      this.onObjectiveUpdated(quest, objective);
    }
    
    // Check if all objectives complete
    this.checkQuestCompletion(questId);
  }
  
  /**
   * Check if quest is complete
   */
  private checkQuestCompletion(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;
    
    // Check required objectives
    const requiredObjectives = quest.objectives.filter(obj => !obj.optional);
    const allComplete = requiredObjectives.every(obj => obj.completed);
    
    if (allComplete) {
      this.completeQuest(questId);
    }
  }
  
  /**
   * Complete a quest
   */
  completeQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;
    
    quest.status = 'completed';
    this.activeQuests.delete(questId);
    this.completedQuests.add(questId);
    
    console.log(`[AdvancedQuestSystem] Quest completed: ${quest.title}`);
    console.log(`Rewards: ${quest.rewards.experience} XP, ${quest.rewards.gold} gold`);
    
    // Unlock follow-up quests
    if (quest.rewards.unlockQuests) {
      quest.rewards.unlockQuests.forEach(unlockId => {
        const unlockQuest = this.quests.get(unlockId);
        if (unlockQuest && unlockQuest.status === 'locked') {
          unlockQuest.status = 'available';
          console.log(`[AdvancedQuestSystem] Unlocked quest: ${unlockQuest.title}`);
        }
      });
    }
    
    if (this.onQuestCompleted) {
      this.onQuestCompleted(quest);
    }
    
    this.updateQuestAvailability();
  }
  
  /**
   * Fail a quest
   */
  failQuest(questId: string): void {
    const quest = this.activeQuests.get(questId);
    if (!quest) return;
    
    quest.status = 'failed';
    this.activeQuests.delete(questId);
    
    console.log(`[AdvancedQuestSystem] Quest failed: ${quest.title}`);
    
    if (this.onQuestFailed) {
      this.onQuestFailed(quest);
    }
  }
  
  /**
   * Check if prerequisites are met
   */
  private arePrerequisitesMet(quest: Quest): boolean {
    return quest.prerequisites.every(prereqId => 
      this.completedQuests.has(prereqId)
    );
  }
  
  /**
   * Update quest availability based on completed quests
   */
  private updateQuestAvailability(): void {
    this.quests.forEach(quest => {
      if (quest.status === 'locked' && this.arePrerequisitesMet(quest)) {
        quest.status = 'available';
      }
    });
  }
  
  /**
   * Get active quests
   */
  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests.values());
  }
  
  /**
   * Get available quests
   */
  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values())
      .filter(q => q.status === 'available');
  }
  
  /**
   * Get quest by ID
   */
  getQuest(questId: string): Quest | undefined {
    return this.quests.get(questId);
  }
  
  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onQuestStarted?: (quest: Quest) => void;
    onQuestCompleted?: (quest: Quest) => void;
    onQuestFailed?: (quest: Quest) => void;
    onObjectiveUpdated?: (quest: Quest, objective: QuestObjective) => void;
  }): void {
    if (callbacks.onQuestStarted) this.onQuestStarted = callbacks.onQuestStarted;
    if (callbacks.onQuestCompleted) this.onQuestCompleted = callbacks.onQuestCompleted;
    if (callbacks.onQuestFailed) this.onQuestFailed = callbacks.onQuestFailed;
    if (callbacks.onObjectiveUpdated) this.onObjectiveUpdated = callbacks.onObjectiveUpdated;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    totalQuests: number;
    activeQuests: number;
    completedQuests: number;
    availableQuests: number;
  } {
    return {
      totalQuests: this.quests.size,
      activeQuests: this.activeQuests.size,
      completedQuests: this.completedQuests.size,
      availableQuests: this.getAvailableQuests().length
    };
  }
}
