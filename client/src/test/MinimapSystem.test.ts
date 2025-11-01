import { describe, it, expect, beforeEach } from 'vitest';
import { MinimapSystem } from '../systems/MinimapSystem';

describe('MinimapSystem', () => {
  let minimapSystem: MinimapSystem;

  beforeEach(() => {
    minimapSystem = new MinimapSystem();
  });

  it('should create a minimap system', () => {
    expect(minimapSystem).toBeDefined();
  });

  it('should update player position on minimap', () => {
    minimapSystem.updatePlayerPosition(10, 10);
    const pos = minimapSystem.getPlayerPosition();
    expect(pos.x).toBe(10);
    expect(pos.y).toBe(10);
  });

  it('should add markers', () => {
    minimapSystem.addMarker('quest_marker', 50, 50, 'quest');
    const marker = minimapSystem.getMarker('quest_marker');
    expect(marker).toBeDefined();
  });

  it('should remove markers', () => {
    minimapSystem.addMarker('temp_marker', 20, 20, 'temp');
    minimapSystem.removeMarker('temp_marker');
    const marker = minimapSystem.getMarker('temp_marker');
    expect(marker).toBeNull();
  });

  it('should zoom in/out', () => {
    const initialZoom = minimapSystem.getZoom();
    minimapSystem.setZoom(2.0);
    expect(minimapSystem.getZoom()).toBe(2.0);
  });

  it('should show/hide minimap', () => {
    minimapSystem.show();
    expect(minimapSystem.isVisible()).toBe(true);
    minimapSystem.hide();
    expect(minimapSystem.isVisible()).toBe(false);
  });
});
