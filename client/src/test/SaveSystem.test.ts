import { describe, it, expect, beforeEach } from 'vitest';
import { SaveSystem } from '../systems/SaveSystem';

describe('SaveSystem', () => {
  let saveSystem: SaveSystem;

  beforeEach(() => {
    saveSystem = new SaveSystem();
    // Clear any previous saves
    localStorage.clear();
  });

  it('should create a save system', () => {
    expect(saveSystem).toBeDefined();
  });

  it('should save game state', () => {
    const state = { playerPos: { x: 0, y: 0, z: 0 }, health: 100 };
    const saved = saveSystem.save('slot1', state);
    expect(saved).toBe(true);
  });

  it('should load game state', () => {
    const state = { playerPos: { x: 5, y: 0, z: 5 }, health: 80 };
    saveSystem.save('slot1', state);
    const loaded = saveSystem.load('slot1');
    expect(loaded).toBeDefined();
    expect(loaded.playerPos.x).toBe(5);
  });

  it('should list save slots', () => {
    saveSystem.save('slot1', { data: 'test1' });
    saveSystem.save('slot2', { data: 'test2' });
    const slots = saveSystem.listSaves();
    expect(slots.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete saves', () => {
    saveSystem.save('slot1', { data: 'test' });
    const deleted = saveSystem.deleteSave('slot1');
    expect(deleted).toBe(true);
    const loaded = saveSystem.load('slot1');
    expect(loaded).toBeNull();
  });

  it('should auto-save', () => {
    const state = { autoSaveData: 'test' };
    saveSystem.autoSave(state);
    const loaded = saveSystem.loadAutoSave();
    expect(loaded).toBeDefined();
  });
});
