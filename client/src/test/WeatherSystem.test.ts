import { describe, it, expect, beforeEach } from 'vitest';
import { WeatherSystem } from '../world/WeatherSystem';

describe('WeatherSystem', () => {
  let weatherSystem: WeatherSystem;

  beforeEach(() => {
    weatherSystem = new WeatherSystem();
  });

  it('should create a weather system', () => {
    expect(weatherSystem).toBeDefined();
  });

  it('should change weather', () => {
    weatherSystem.setWeather('rain');
    expect(weatherSystem.getCurrentWeather()).toBe('rain');
  });

  it('should transition between weather states', () => {
    weatherSystem.setWeather('clear');
    weatherSystem.transitionTo('storm', 5);
    weatherSystem.update(6);
    expect(weatherSystem.getCurrentWeather()).toBe('storm');
  });

  it('should control weather intensity', () => {
    weatherSystem.setWeather('rain');
    weatherSystem.setIntensity(0.8);
    expect(weatherSystem.getIntensity()).toBe(0.8);
  });

  it('should affect game environment', () => {
    weatherSystem.setWeather('fog');
    const effects = weatherSystem.getEnvironmentEffects();
    expect(effects).toBeDefined();
  });

  it('should update weather over time', () => {
    weatherSystem.enableDynamicWeather(true);
    weatherSystem.update(1.0);
    expect(weatherSystem.getCurrentWeather()).toBeDefined();
  });
});
