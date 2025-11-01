import { describe, it, expect, beforeEach } from 'vitest';
import { InputManager } from '../systems/InputManager';

describe('InputManager', () => {
  let inputManager: InputManager;

  beforeEach(() => {
    inputManager = new InputManager();
  });

  it('should create an input manager', () => {
    expect(inputManager).toBeDefined();
  });

  it('should track key states', () => {
    inputManager.onKeyDown('w');
    expect(inputManager.isKeyPressed('w')).toBe(true);
  });

  it('should release keys', () => {
    inputManager.onKeyDown('w');
    inputManager.onKeyUp('w');
    expect(inputManager.isKeyPressed('w')).toBe(false);
  });

  it('should track mouse position', () => {
    inputManager.onMouseMove(100, 200);
    const pos = inputManager.getMousePosition();
    expect(pos.x).toBe(100);
    expect(pos.y).toBe(200);
  });

  it('should handle mouse buttons', () => {
    inputManager.onMouseDown(0);
    expect(inputManager.isMouseButtonPressed(0)).toBe(true);
  });

  it('should bind actions to keys', () => {
    inputManager.bindAction('jump', 'space');
    expect(inputManager.getActionKey('jump')).toBe('space');
  });

  it('should trigger action callbacks', () => {
    let triggered = false;
    inputManager.bindAction('attack', 'e', () => { triggered = true; });
    inputManager.onKeyDown('e');
    inputManager.update();
    expect(triggered).toBe(true);
  });
});
