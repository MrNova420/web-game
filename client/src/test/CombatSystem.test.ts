import { describe, it, expect, beforeEach } from 'vitest';
import { CombatSystem } from '../systems/CombatSystem';

describe('CombatSystem', () => {
  let combatSystem: CombatSystem;

  beforeEach(() => {
    combatSystem = new CombatSystem();
  });

  it('should create a combat system', () => {
    expect(combatSystem).toBeDefined();
  });

  it('should calculate damage', () => {
    const damage = combatSystem.calculateDamage(100, 10, 0);
    expect(damage).toBeGreaterThan(0);
    expect(damage).toBeLessThanOrEqual(100);
  });

  it('should apply critical hits', () => {
    const normalDamage = combatSystem.calculateDamage(100, 0, 0);
    const critDamage = combatSystem.calculateDamage(100, 0, 100);
    expect(critDamage).toBeGreaterThanOrEqual(normalDamage);
  });

  it('should handle defense reduction', () => {
    const lowDefenseDamage = combatSystem.calculateDamage(100, 10, 0);
    const highDefenseDamage = combatSystem.calculateDamage(100, 50, 0);
    expect(highDefenseDamage).toBeLessThan(lowDefenseDamage);
  });

  it('should register hit events', () => {
    const hit = combatSystem.registerHit('player1', 'enemy1', 50);
    expect(hit).toBeDefined();
    expect(hit.attacker).toBe('player1');
    expect(hit.target).toBe('enemy1');
  });

  it('should track combat stats', () => {
    combatSystem.registerHit('player1', 'enemy1', 50);
    const stats = combatSystem.getStats('player1');
    expect(stats).toBeDefined();
    expect(stats.damageDealt).toBeGreaterThan(0);
  });
});
