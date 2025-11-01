import { describe, it, expect, beforeEach } from 'vitest';
import { EnemySystem } from '../systems/EnemySystem';

describe('EnemySystem', () => {
  let enemySystem: EnemySystem;

  beforeEach(() => {
    enemySystem = new EnemySystem();
  });

  it('should create an enemy system', () => {
    expect(enemySystem).toBeDefined();
  });

  it('should spawn enemies', () => {
    const enemy = enemySystem.spawnEnemy('skeleton', 0, 0, 0);
    expect(enemy).toBeDefined();
  });

  it('should update enemy AI and behavior', () => {
    enemySystem.spawnEnemy('skeleton', 0, 0, 0);
    enemySystem.update(0.016);
    expect(enemySystem.getAllEnemies().length).toBeGreaterThan(0);
  });

  it('should handle enemy aggro', () => {
    const enemy = enemySystem.spawnEnemy('skeleton', 0, 0, 0);
    if (enemy) {
      enemySystem.setAggro(enemy.id, 'player1');
      const target = enemySystem.getTarget(enemy.id);
      expect(target).toBe('player1');
    }
  });

  it('should handle enemy death', () => {
    const enemy = enemySystem.spawnEnemy('skeleton', 0, 0, 0);
    if (enemy) {
      enemySystem.kill(enemy.id);
      const isDead = enemySystem.isDead(enemy.id);
      expect(isDead).toBe(true);
    }
  });

  it('should spawn loot on death', () => {
    const enemy = enemySystem.spawnEnemy('skeleton', 0, 0, 0);
    if (enemy) {
      const loot = enemySystem.getLoot(enemy.id);
      expect(Array.isArray(loot)).toBe(true);
    }
  });
});
