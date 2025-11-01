import { describe, it, expect, beforeEach } from 'vitest';
import { QuestSystem } from '../systems/QuestSystem';

describe('QuestSystem', () => {
  let questSystem: QuestSystem;

  beforeEach(() => {
    questSystem = new QuestSystem();
  });

  it('should create a quest system', () => {
    expect(questSystem).toBeDefined();
  });

  it('should add quests', () => {
    const quest = {
      id: 'quest1',
      title: 'Test Quest',
      description: 'A test quest',
      objectives: [],
      rewards: []
    };
    questSystem.addQuest(quest);
    const retrieved = questSystem.getQuest('quest1');
    expect(retrieved).toBeDefined();
  });

  it('should track quest progress', () => {
    const quest = {
      id: 'quest2',
      title: 'Collect Items',
      objectives: [{ type: 'collect', item: 'wood', amount: 10, current: 0 }]
    };
    questSystem.addQuest(quest);
    questSystem.updateProgress('quest2', 0, 5);
    const progress = questSystem.getProgress('quest2');
    expect(progress).toBeDefined();
  });

  it('should complete quests', () => {
    const quest = {
      id: 'quest3',
      title: 'Simple Quest',
      objectives: [{ type: 'talk', npc: 'villager', current: 0, target: 1 }]
    };
    questSystem.addQuest(quest);
    questSystem.updateProgress('quest3', 0, 1);
    const isComplete = questSystem.isQuestComplete('quest3');
    expect(typeof isComplete).toBe('boolean');
  });

  it('should list active quests', () => {
    const activeQuests = questSystem.getActiveQuests();
    expect(Array.isArray(activeQuests)).toBe(true);
  });
});
