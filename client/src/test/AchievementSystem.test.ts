import { describe, it, expect, beforeEach } from 'vitest';
import { AchievementSystem } from '../systems/AchievementSystem';

describe('AchievementSystem', () => {
  let achievementSystem: AchievementSystem;

  beforeEach(() => {
    achievementSystem = new AchievementSystem();
  });

  it('should create an achievement system', () => {
    expect(achievementSystem).toBeDefined();
  });

  it('should track achievements', () => {
    const achievements = achievementSystem.getAllAchievements();
    expect(Array.isArray(achievements)).toBe(true);
  });

  it('should unlock achievements', () => {
    achievementSystem.unlock('first_kill');
    expect(achievementSystem.isUnlocked('first_kill')).toBe(true);
  });

  it('should track progress', () => {
    achievementSystem.updateProgress('monster_slayer', 10);
    const progress = achievementSystem.getProgress('monster_slayer');
    expect(progress).toBeGreaterThanOrEqual(10);
  });

  it('should get unlocked achievements', () => {
    achievementSystem.unlock('achievement1');
    achievementSystem.unlock('achievement2');
    const unlocked = achievementSystem.getUnlockedAchievements();
    expect(unlocked.length).toBeGreaterThanOrEqual(2);
  });

  it('should calculate completion percentage', () => {
    const percentage = achievementSystem.getCompletionPercentage();
    expect(percentage).toBeGreaterThanOrEqual(0);
    expect(percentage).toBeLessThanOrEqual(100);
  });
});
