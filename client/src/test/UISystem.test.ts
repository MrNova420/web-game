import { describe, it, expect, beforeEach } from 'vitest';
import { UISystem } from '../systems/UISystem';

describe('UISystem', () => {
  let uiSystem: UISystem;

  beforeEach(() => {
    uiSystem = new UISystem();
  });

  it('should create a UI system', () => {
    expect(uiSystem).toBeDefined();
  });

  it('should show/hide UI elements', () => {
    uiSystem.show('inventory');
    expect(uiSystem.isVisible('inventory')).toBe(true);
    uiSystem.hide('inventory');
    expect(uiSystem.isVisible('inventory')).toBe(false);
  });

  it('should toggle UI elements', () => {
    const wasVisible = uiSystem.isVisible('menu');
    uiSystem.toggle('menu');
    expect(uiSystem.isVisible('menu')).toBe(!wasVisible);
  });

  it('should handle notifications', () => {
    uiSystem.showNotification('Test notification');
    const notifications = uiSystem.getNotifications();
    expect(notifications.length).toBeGreaterThan(0);
  });

  it('should update UI state', () => {
    uiSystem.updateHealth(75);
    const health = uiSystem.getDisplayedHealth();
    expect(health).toBe(75);
  });

  it('should handle dialog boxes', () => {
    uiSystem.showDialog('NPC Dialog', 'Hello adventurer!');
    expect(uiSystem.isDialogOpen()).toBe(true);
  });
});
