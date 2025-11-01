import { describe, it, expect, beforeEach } from 'vitest';
import { IntegrationManager } from '../systems/IntegrationManager';

describe('IntegrationManager', () => {
  let integrationManager: IntegrationManager;

  beforeEach(() => {
    integrationManager = new IntegrationManager();
  });

  it('should create an integration manager', () => {
    expect(integrationManager).toBeDefined();
  });

  it('should register systems', () => {
    const mockSystem = { id: 'testSystem', update: () => {} };
    integrationManager.registerSystem('testSystem', mockSystem);
    expect(integrationManager.hasSystem('testSystem')).toBe(true);
  });

  it('should update all systems', () => {
    let updated = false;
    const mockSystem = { 
      id: 'test', 
      update: () => { updated = true; }
    };
    integrationManager.registerSystem('test', mockSystem);
    integrationManager.updateAll(0.016);
    expect(updated).toBe(true);
  });

  it('should handle system dependencies', () => {
    const system1 = { id: 's1', update: () => {} };
    const system2 = { id: 's2', update: () => {}, dependencies: ['s1'] };
    integrationManager.registerSystem('s1', system1);
    integrationManager.registerSystem('s2', system2);
    expect(integrationManager.hasSystem('s2')).toBe(true);
  });

  it('should get system by id', () => {
    const mockSystem = { id: 'mySystem' };
    integrationManager.registerSystem('mySystem', mockSystem);
    const retrieved = integrationManager.getSystem('mySystem');
    expect(retrieved).toBeDefined();
  });

  it('should unregister systems', () => {
    integrationManager.registerSystem('temp', { id: 'temp' });
    integrationManager.unregisterSystem('temp');
    expect(integrationManager.hasSystem('temp')).toBe(false);
  });
});
