import { describe, it, expect, beforeEach } from 'vitest';
import { DayNightCycle } from '../world/DayNightCycle';

describe('DayNightCycle', () => {
  let dayNightCycle: DayNightCycle;

  beforeEach(() => {
    dayNightCycle = new DayNightCycle();
  });

  it('should create a day/night cycle', () => {
    expect(dayNightCycle).toBeDefined();
  });

  it('should track time of day', () => {
    const time = dayNightCycle.getTimeOfDay();
    expect(time).toBeGreaterThanOrEqual(0);
    expect(time).toBeLessThanOrEqual(24);
  });

  it('should update time', () => {
    const initialTime = dayNightCycle.getTimeOfDay();
    dayNightCycle.update(1.0);
    const newTime = dayNightCycle.getTimeOfDay();
    expect(newTime).not.toBe(initialTime);
  });

  it('should determine day/night', () => {
    dayNightCycle.setTime(12);
    expect(dayNightCycle.isDay()).toBe(true);
    dayNightCycle.setTime(0);
    expect(dayNightCycle.isNight()).toBe(true);
  });

  it('should control time speed', () => {
    dayNightCycle.setTimeScale(2.0);
    expect(dayNightCycle.getTimeScale()).toBe(2.0);
  });

  it('should get lighting data', () => {
    dayNightCycle.setTime(12);
    const lighting = dayNightCycle.getLighting();
    expect(lighting).toBeDefined();
    expect(lighting.sunIntensity).toBeGreaterThan(0);
  });
});
