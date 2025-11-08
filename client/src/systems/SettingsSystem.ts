/**
 * Game settings
 */
export interface GameSettings {
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    shadows: boolean;
    antialiasing: boolean;
    renderDistance: number;
    fov: number;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    ambientVolume: number;
  };
  controls: {
    mouseSensitivity: number;
    invertY: boolean;
    keyBindings: { [action: string]: string };
  };
  gameplay: {
    showTutorial: boolean;
    showDamageNumbers: boolean;
    autoSave: boolean;
    chatFilter: boolean;
  };
  ui: {
    showMinimap: boolean;
    showFPS: boolean;
    uiScale: number;
    chatOpacity: number;
  };
}

/**
 * SettingsSystem - Manages game settings
 */
export class SettingsSystem {
  private settings: GameSettings;
  private readonly SETTINGS_KEY = 'fantasy_mmo_settings';

  constructor() {
    // Always start with defaults to ensure valid settings
    this.settings = this.getDefaultSettings();
    console.log('SettingsSystem: Default settings loaded');
    
    // Try to load saved settings
    const loaded = this.load();
    if (!loaded) {
      // If no settings found, save defaults for next time
      this.save();
      console.log('SettingsSystem: Initialized with default settings (saved for future use)');
    } else {
      console.log('SettingsSystem: Loaded saved settings from localStorage');
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): GameSettings {
    return {
      graphics: {
        quality: 'medium',
        shadows: true,
        antialiasing: true,
        renderDistance: 100,
        fov: 75
      },
      audio: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.7,
        ambientVolume: 0.4
      },
      controls: {
        mouseSensitivity: 1.0,
        invertY: false,
        keyBindings: {
          move_forward: 'w',
          move_backward: 's',
          move_left: 'a',
          move_right: 'd',
          jump: ' ',
          interact: 'e',
          inventory: 'i',
          character: 'c',
          quests: 'q',
          map: 'm',
          attack: '1',
          spell: '2'
        }
      },
      gameplay: {
        showTutorial: true,
        showDamageNumbers: true,
        autoSave: true,
        chatFilter: true
      },
      ui: {
        showMinimap: true,
        showFPS: false,
        uiScale: 1.0,
        chatOpacity: 0.8
      }
    };
  }

  /**
   * Load settings from storage
   */
  load(): boolean {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      if (stored) {
        const loaded = JSON.parse(stored) as GameSettings;
        // Merge with defaults to handle new settings
        this.settings = { ...this.getDefaultSettings(), ...loaded };
        console.log('Settings loaded');
        return true;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return false;
  }

  /**
   * Save settings to storage
   */
  save(): boolean {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      console.log('Settings saved');
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Get all settings
   */
  getAll(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Get graphics settings
   */
  getGraphics(): GameSettings['graphics'] {
    return { ...this.settings.graphics };
  }

  /**
   * Set graphics quality
   */
  setGraphicsQuality(quality: 'low' | 'medium' | 'high' | 'ultra') {
    this.settings.graphics.quality = quality;
    
    // Adjust other settings based on quality
    switch (quality) {
      case 'low':
        this.settings.graphics.shadows = false;
        this.settings.graphics.antialiasing = false;
        this.settings.graphics.renderDistance = 50;
        break;
      case 'medium':
        this.settings.graphics.shadows = true;
        this.settings.graphics.antialiasing = false;
        this.settings.graphics.renderDistance = 100;
        break;
      case 'high':
        this.settings.graphics.shadows = true;
        this.settings.graphics.antialiasing = true;
        this.settings.graphics.renderDistance = 150;
        break;
      case 'ultra':
        this.settings.graphics.shadows = true;
        this.settings.graphics.antialiasing = true;
        this.settings.graphics.renderDistance = 200;
        break;
    }
    
    this.save();
  }

  /**
   * Get audio settings
   */
  getAudio(): GameSettings['audio'] {
    return { ...this.settings.audio };
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number) {
    this.settings.audio.masterVolume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number) {
    this.settings.audio.musicVolume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  /**
   * Set SFX volume
   */
  setSFXVolume(volume: number) {
    this.settings.audio.sfxVolume = Math.max(0, Math.min(1, volume));
    this.save();
  }

  /**
   * Get controls settings
   */
  getControls(): GameSettings['controls'] {
    return { ...this.settings.controls };
  }

  /**
   * Set mouse sensitivity
   */
  setMouseSensitivity(sensitivity: number) {
    this.settings.controls.mouseSensitivity = Math.max(0.1, Math.min(5, sensitivity));
    this.save();
  }

  /**
   * Set key binding
   */
  setKeyBinding(action: string, key: string) {
    this.settings.controls.keyBindings[action] = key;
    this.save();
  }

  /**
   * Get gameplay settings
   */
  getGameplay(): GameSettings['gameplay'] {
    return { ...this.settings.gameplay };
  }

  /**
   * Toggle auto-save
   */
  setAutoSave(enabled: boolean) {
    this.settings.gameplay.autoSave = enabled;
    this.save();
  }

  /**
   * Get UI settings
   */
  getUI(): GameSettings['ui'] {
    return { ...this.settings.ui };
  }

  /**
   * Toggle minimap
   */
  setShowMinimap(show: boolean) {
    this.settings.ui.showMinimap = show;
    this.save();
  }

  /**
   * Toggle FPS display
   */
  setShowFPS(show: boolean) {
    this.settings.ui.showFPS = show;
    this.save();
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.settings = this.getDefaultSettings();
    this.save();
    console.log('Settings reset to defaults');
  }

  /**
   * Apply settings (for systems that need notification)
   */
  apply(callbacks?: {
    onGraphicsChange?: (settings: GameSettings['graphics']) => void;
    onAudioChange?: (settings: GameSettings['audio']) => void;
    onControlsChange?: (settings: GameSettings['controls']) => void;
  }) {
    if (callbacks) {
      if (callbacks.onGraphicsChange) {
        callbacks.onGraphicsChange(this.settings.graphics);
      }
      if (callbacks.onAudioChange) {
        callbacks.onAudioChange(this.settings.audio);
      }
      if (callbacks.onControlsChange) {
        callbacks.onControlsChange(this.settings.controls);
      }
    }
  }
}
