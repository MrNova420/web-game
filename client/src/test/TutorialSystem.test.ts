import { describe, it, expect, beforeEach } from 'vitest';
import { TutorialSystem } from '../systems/TutorialSystem';

describe('TutorialSystem', () => {
  let tutorialSystem: TutorialSystem;

  beforeEach(() => {
    tutorialSystem = new TutorialSystem();
  });

  it('should create a tutorial system', () => {
    expect(tutorialSystem).toBeDefined();
  });

  it('should start tutorial', () => {
    tutorialSystem.startTutorial();
    expect(tutorialSystem.isActive()).toBe(true);
  });

  it('should advance tutorial steps', () => {
    tutorialSystem.startTutorial();
    const initialStep = tutorialSystem.getCurrentStep();
    tutorialSystem.nextStep();
    expect(tutorialSystem.getCurrentStep()).toBeGreaterThan(initialStep);
  });

  it('should complete tutorial', () => {
    tutorialSystem.startTutorial();
    tutorialSystem.complete();
    expect(tutorialSystem.isCompleted()).toBe(true);
  });

  it('should skip tutorial', () => {
    tutorialSystem.startTutorial();
    tutorialSystem.skip();
    expect(tutorialSystem.isActive()).toBe(false);
  });

  it('should track tutorial progress', () => {
    tutorialSystem.startTutorial();
    const progress = tutorialSystem.getProgress();
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });
});
