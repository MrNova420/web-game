import { describe, it, expect, beforeEach } from 'vitest';
import { DungeonSystem } from '../systems/DungeonSystem';

describe('DungeonSystem', () => {
  let dungeonSystem: DungeonSystem;

  beforeEach(() => {
    dungeonSystem = new DungeonSystem();
  });

  it('should create a dungeon system', () => {
    expect(dungeonSystem).toBeDefined();
  });

  it('should generate dungeons', () => {
    const dungeon = dungeonSystem.generateDungeon('forest_dungeon', 1);
    expect(dungeon).toBeDefined();
  });

  it('should spawn dungeon enemies', () => {
    const dungeon = dungeonSystem.generateDungeon('cave', 1);
    const enemies = dungeonSystem.getDungeonEnemies(dungeon.id);
    expect(Array.isArray(enemies)).toBe(true);
  });

  it('should place dungeon loot', () => {
    const dungeon = dungeonSystem.generateDungeon('ruins', 1);
    const loot = dungeonSystem.getDungeonLoot(dungeon.id);
    expect(Array.isArray(loot)).toBe(true);
  });

  it('should track dungeon completion', () => {
    const dungeon = dungeonSystem.generateDungeon('temple', 1);
    dungeonSystem.completeDungeon(dungeon.id);
    expect(dungeonSystem.isCompleted(dungeon.id)).toBe(true);
  });

  it('should get dungeon difficulty', () => {
    const dungeon = dungeonSystem.generateDungeon('crypt', 5);
    const difficulty = dungeonSystem.getDifficulty(dungeon.id);
    expect(difficulty).toBeGreaterThanOrEqual(1);
  });
});
