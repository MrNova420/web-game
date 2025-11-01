import { describe, it, expect, beforeEach } from 'vitest';
import { CharacterSystem } from '../systems/CharacterSystem';

describe('CharacterSystem', () => {
  let characterSystem: CharacterSystem;

  beforeEach(() => {
    characterSystem = new CharacterSystem();
  });

  it('should create a character system', () => {
    expect(characterSystem).toBeDefined();
  });

  it('should create player characters', () => {
    const character = characterSystem.createCharacter('player1', 'warrior');
    expect(character).toBeDefined();
  });

  it('should get character by id', () => {
    characterSystem.createCharacter('player1', 'mage');
    const character = characterSystem.getCharacter('player1');
    expect(character).toBeDefined();
  });

  it('should update character position', () => {
    characterSystem.createCharacter('player1', 'warrior');
    characterSystem.setPosition('player1', 10, 0, 10);
    const pos = characterSystem.getPosition('player1');
    expect(pos.x).toBe(10);
    expect(pos.z).toBe(10);
  });

  it('should handle character equipment', () => {
    characterSystem.createCharacter('player1', 'warrior');
    const equipped = characterSystem.equipItem('player1', 'sword', 'weapon');
    expect(typeof equipped).toBe('boolean');
  });

  it('should update character animations', () => {
    characterSystem.createCharacter('player1', 'warrior');
    characterSystem.playAnimation('player1', 'walk');
    const anim = characterSystem.getCurrentAnimation('player1');
    expect(anim).toBeDefined();
  });
});
