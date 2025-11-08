/**
 * AdvancedSettingsSystem - Professional settings management
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Settings Systems
 * Graphics, audio, controls, gameplay settings
 */

interface GraphicsSettings {
  quality: 'ultra' | 'high' | 'medium' | 'low' | 'mobile';
  shadows: boolean;
  shadowQuality: 'ultra' | 'high' | 'medium' | 'low';
  antialiasing: 'SMAA' | 'FXAA' | 'none';
  renderScale: number;
  drawDistance: number;
  particleDensity: number;
  postProcessing: boolean;
  ambientOcclusion: boolean;
  bloom: boolean;
  vsync: boolean;
  targetFPS: number;
}

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  uiVolume: number;
}

interface ControlSettings {
  mouseSensitivity: number;
  invertY: boolean;
  keyBindings: Map<string, string>;
  gamepadEnabled: boolean;
  gamepadDeadzone: number;
}

interface GameplaySettings {
  difficulty: 'easy' | 'normal' | 'hard' | 'hardcore';
  autoSave: boolean;
  autoSaveInterval: number;
  showDamageNumbers: boolean;
  showHealthBars: boolean;
  tutorialHints: boolean;
  language: string;
}

export class AdvancedSettingsSystem {
  private graphics: GraphicsSettings;
  private audio: AudioSettings;
  private controls: ControlSettings;
  private gameplay: GameplaySettings;
  
  // Callbacks
  private onSettingsChanged: ((category: string) => void) | null = null;
  
  constructor() {
    // Default graphics settings
    this.graphics = {
      quality: 'high',
      shadows: true,
      shadowQuality: 'high',
      antialiasing: 'FXAA',
      renderScale: 1.0,
      drawDistance: 8,
      particleDensity: 0.8,
      postProcessing: true,
      ambientOcclusion: true,
      bloom: true,
      vsync: true,
      targetFPS: 60
    };
    
    // Default audio settings
    this.audio = {
      masterVolume: 0.8,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      ambientVolume: 0.5,
      voiceVolume: 1.0,
      uiVolume: 0.6
    };
    
    // Default control settings
    this.controls = {
      mouseSensitivity: 1.0,
      invertY: false,
      keyBindings: new Map([
        ['forward', 'KeyW'],
        ['backward', 'KeyS'],
        ['left', 'KeyA'],
        ['right', 'KeyD'],
        ['jump', 'Space'],
        ['sprint', 'ShiftLeft'],
        ['crouch', 'ControlLeft'],
        ['interact', 'KeyE'],
        ['inventory', 'KeyI'],
        ['map', 'KeyM'],
        ['menu', 'Escape']
      ]),
      gamepadEnabled: true,
      gamepadDeadzone: 0.15
    };
    
    // Default gameplay settings
    this.gameplay = {
      difficulty: 'normal',
      autoSave: true,
      autoSaveInterval: 300,
      showDamageNumbers: true,
      showHealthBars: true,
      tutorialHints: true,
      language: 'en'
    };
    
    // Load saved settings
    this.loadSettings();
    
    console.log('[AdvancedSettingsSystem] Initialized');
  }
  
  /**
   * Get graphics settings
   */
  getGraphicsSettings(): GraphicsSettings {
    return { ...this.graphics };
  }
  
  /**
   * Set graphics quality preset
   */
  setGraphicsQuality(quality: GraphicsSettings['quality']): void {
    this.graphics.quality = quality;
    
    // Apply preset
    switch (quality) {
      case 'ultra':
        this.graphics.shadows = true;
        this.graphics.shadowQuality = 'ultra';
        this.graphics.antialiasing = 'SMAA';
        this.graphics.renderScale = 1.0;
        this.graphics.drawDistance = 10;
        this.graphics.particleDensity = 1.0;
        this.graphics.postProcessing = true;
        this.graphics.ambientOcclusion = true;
        this.graphics.bloom = true;
        break;
      case 'high':
        this.graphics.shadows = true;
        this.graphics.shadowQuality = 'high';
        this.graphics.antialiasing = 'FXAA';
        this.graphics.renderScale = 1.0;
        this.graphics.drawDistance = 8;
        this.graphics.particleDensity = 0.8;
        this.graphics.postProcessing = true;
        this.graphics.ambientOcclusion = true;
        this.graphics.bloom = true;
        break;
      case 'medium':
        this.graphics.shadows = true;
        this.graphics.shadowQuality = 'medium';
        this.graphics.antialiasing = 'FXAA';
        this.graphics.renderScale = 0.85;
        this.graphics.drawDistance = 6;
        this.graphics.particleDensity = 0.5;
        this.graphics.postProcessing = true;
        this.graphics.ambientOcclusion = false;
        this.graphics.bloom = false;
        break;
      case 'low':
        this.graphics.shadows = true;
        this.graphics.shadowQuality = 'low';
        this.graphics.antialiasing = 'none';
        this.graphics.renderScale = 0.75;
        this.graphics.drawDistance = 4;
        this.graphics.particleDensity = 0.2;
        this.graphics.postProcessing = false;
        this.graphics.ambientOcclusion = false;
        this.graphics.bloom = false;
        break;
      case 'mobile':
        this.graphics.shadows = false;
        this.graphics.shadowQuality = 'low';
        this.graphics.antialiasing = 'none';
        this.graphics.renderScale = 0.6;
        this.graphics.drawDistance = 3;
        this.graphics.particleDensity = 0.1;
        this.graphics.postProcessing = false;
        this.graphics.ambientOcclusion = false;
        this.graphics.bloom = false;
        break;
    }
    
    this.notifyChanged('graphics');
  }
  
  /**
   * Set individual graphics setting
   */
  setGraphicsSetting<K extends keyof GraphicsSettings>(key: K, value: GraphicsSettings[K]): void {
    this.graphics[key] = value;
    this.notifyChanged('graphics');
  }
  
  /**
   * Get audio settings
   */
  getAudioSettings(): AudioSettings {
    return { ...this.audio };
  }
  
  /**
   * Set audio setting
   */
  setAudioSetting<K extends keyof AudioSettings>(key: K, value: AudioSettings[K]): void {
    this.audio[key] = value;
    this.notifyChanged('audio');
  }
  
  /**
   * Get control settings
   */
  getControlSettings(): ControlSettings {
    return {
      ...this.controls,
      keyBindings: new Map(this.controls.keyBindings)
    };
  }
  
  /**
   * Set control setting
   */
  setControlSetting<K extends keyof Omit<ControlSettings, 'keyBindings'>>(
    key: K,
    value: ControlSettings[K]
  ): void {
    (this.controls as any)[key] = value;
    this.notifyChanged('controls');
  }
  
  /**
   * Rebind key
   */
  rebindKey(action: string, key: string): void {
    this.controls.keyBindings.set(action, key);
    this.notifyChanged('controls');
  }
  
  /**
   * Get gameplay settings
   */
  getGameplaySettings(): GameplaySettings {
    return { ...this.gameplay };
  }
  
  /**
   * Set gameplay setting
   */
  setGameplaySetting<K extends keyof GameplaySettings>(key: K, value: GameplaySettings[K]): void {
    this.gameplay[key] = value;
    this.notifyChanged('gameplay');
  }
  
  /**
   * Save settings to localStorage
   */
  saveSettings(): void {
    const settings = {
      graphics: this.graphics,
      audio: this.audio,
      controls: {
        ...this.controls,
        keyBindings: Array.from(this.controls.keyBindings.entries())
      },
      gameplay: this.gameplay
    };
    
    localStorage.setItem('game_settings', JSON.stringify(settings));
    console.log('[AdvancedSettingsSystem] Settings saved');
  }
  
  /**
   * Load settings from localStorage
   */
  loadSettings(): void {
    const saved = localStorage.getItem('game_settings');
    if (!saved) return;
    
    try {
      const settings = JSON.parse(saved);
      
      if (settings.graphics) this.graphics = settings.graphics;
      if (settings.audio) this.audio = settings.audio;
      if (settings.controls) {
        this.controls = {
          ...settings.controls,
          keyBindings: new Map(settings.controls.keyBindings)
        };
      }
      if (settings.gameplay) this.gameplay = settings.gameplay;
      
      console.log('[AdvancedSettingsSystem] Settings loaded');
    } catch (error) {
      console.error('[AdvancedSettingsSystem] Failed to load settings:', error);
    }
  }
  
  /**
   * Reset to defaults
   */
  resetToDefaults(category: 'all' | 'graphics' | 'audio' | 'controls' | 'gameplay'): void {
    if (category === 'all' || category === 'graphics') {
      this.setGraphicsQuality('high');
    }
    
    if (category === 'all' || category === 'audio') {
      this.audio = {
        masterVolume: 0.8,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        ambientVolume: 0.5,
        voiceVolume: 1.0,
        uiVolume: 0.6
      };
    }
    
    if (category === 'all' || category === 'controls') {
      this.controls.mouseSensitivity = 1.0;
      this.controls.invertY = false;
      this.controls.gamepadDeadzone = 0.15;
    }
    
    if (category === 'all' || category === 'gameplay') {
      this.gameplay = {
        difficulty: 'normal',
        autoSave: true,
        autoSaveInterval: 300,
        showDamageNumbers: true,
        showHealthBars: true,
        tutorialHints: true,
        language: 'en'
      };
    }
    
    this.notifyChanged(category);
    console.log(`[AdvancedSettingsSystem] Reset ${category} to defaults`);
  }
  
  /**
   * Notify settings changed
   */
  private notifyChanged(category: string): void {
    this.saveSettings();
    if (this.onSettingsChanged) {
      this.onSettingsChanged(category);
    }
  }
  
  /**
   * Set callback
   */
  setCallback(callback: (category: string) => void): void {
    this.onSettingsChanged = callback;
  }
}
