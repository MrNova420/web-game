import { describe, it, expect, beforeEach } from 'vitest';
import { PlayerStatsSystem } from '../systems/PlayerStatsSystem';

describe('PlayerStatsSystem', () => {
  let statsSystem: PlayerStatsSystem;

  beforeEach(() => {
    statsSystem = new PlayerStatsSystem();
  });

  it('should create a player stats system', () => {
    expect(statsSystem).toBeDefined();
  });

  it('should initialize player stats', () => {
    const stats = statsSystem.getStats('player1');
    expect(stats).toBeDefined();
    expect(stats.health).toBeGreaterThan(0);
  });

  it('should modify health', () => {
    const initialHealth = statsSystem.getHealth('player1');
    statsSystem.modifyHealth('player1', -10);
    const newHealth = statsSystem.getHealth('player1');
    expect(newHealth).toBeLessThan(initialHealth);
  });

  it('should not allow health below zero', () => {
    statsSystem.modifyHealth('player1', -10000);
    const health = statsSystem.getHealth('player1');
    expect(health).toBeGreaterThanOrEqual(0);
  });

  it('should track experience', () => {
    statsSystem.addExperience('player1', 100);
    const xp = statsSystem.getExperience('player1');
    expect(xp).toBeGreaterThanOrEqual(100);
  });

  it('should level up when enough experience gained', () => {
    const initialLevel = statsSystem.getLevel('player1');
    statsSystem.addExperience('player1', 10000);
    const newLevel = statsSystem.getLevel('player1');
    expect(newLevel).toBeGreaterThanOrEqual(initialLevel);
  });

  it('should track stamina', () => {
    const stamina = statsSystem.getStamina('player1');
    expect(typeof stamina).toBe('number');
    expect(stamina).toBeGreaterThan(0);
  });

  it('should regenerate stats over time', () => {
    statsSystem.modifyHealth('player1', -50);
    const healthBefore = statsSystem.getHealth('player1');
    statsSystem.update(1.0); // Update for 1 second
    const healthAfter = statsSystem.getHealth('player1');
    expect(healthAfter).toBeGreaterThanOrEqual(healthBefore);
  });
});
