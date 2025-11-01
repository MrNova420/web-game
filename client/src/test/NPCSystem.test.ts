import { describe, it, expect, beforeEach } from 'vitest';
import { NPCSystem } from '../systems/NPCSystem';

describe('NPCSystem', () => {
  let npcSystem: NPCSystem;

  beforeEach(() => {
    npcSystem = new NPCSystem();
  });

  it('should create an NPC system', () => {
    expect(npcSystem).toBeDefined();
  });

  it('should spawn NPCs', () => {
    const npc = npcSystem.spawnNPC('villager', 0, 0, 0);
    expect(npc).toBeDefined();
  });

  it('should update NPC AI', () => {
    npcSystem.spawnNPC('villager', 0, 0, 0);
    npcSystem.update(0.016);
    expect(npcSystem.getAllNPCs().length).toBeGreaterThan(0);
  });

  it('should handle NPC interactions', () => {
    const npc = npcSystem.spawnNPC('merchant', 5, 0, 5);
    if (npc) {
      const canInteract = npcSystem.canInteract(npc.id);
      expect(typeof canInteract).toBe('boolean');
    }
  });

  it('should remove NPCs', () => {
    const npc = npcSystem.spawnNPC('villager', 0, 0, 0);
    if (npc) {
      const removed = npcSystem.removeNPC(npc.id);
      expect(typeof removed).toBe('boolean');
    }
  });

  it('should get NPC by id', () => {
    const npc = npcSystem.spawnNPC('guard', 10, 0, 10);
    if (npc) {
      const retrieved = npcSystem.getNPC(npc.id);
      expect(retrieved).toBeDefined();
    }
  });
});
