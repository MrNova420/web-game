/**
 * Save data structure
 */
export interface SaveData {
  version: string;
  timestamp: number;
  player: {
    id: string;
    position: { x: number; y: number; z: number };
    stats: {
      health: number;
      maxHealth: number;
      mana: number;
      maxMana: number;
      stamina: number;
      maxStamina: number;
      level: number;
      experience: number;
      experienceToNext: number;
      strength: number;
      dexterity: number;
      intelligence: number;
      vitality: number;
    };
    inventory: Array<{ itemId: string; count: number }>;
    equipment: { [slot: string]: string };
  };
  quests: Array<{
    id: string;
    status: string;
    progress: { [objectiveId: string]: number };
  }>;
  world: {
    discoveredBiomes: string[];
    visitedLocations: string[];
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    graphics: string;
  };
}

/**
 * SaveSystem - Manages game save/load functionality
 * Uses browser localStorage
 */
export class SaveSystem {
  private readonly SAVE_KEY = 'fantasy_mmo_save';
  private readonly SAVE_VERSION = '1.0.0';
  private autoSaveInterval: number | null = null;
  private readonly AUTO_SAVE_INTERVAL = 60000; // 60 seconds

  constructor() {
    console.log('SaveSystem initialized');
  }

  /**
   * Save game data
   */
  save(data: SaveData): boolean {
    try {
      data.version = this.SAVE_VERSION;
      data.timestamp = Date.now();
      
      const saveString = JSON.stringify(data);
      localStorage.setItem(this.SAVE_KEY, saveString);
      
      console.log('Game saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game data
   */
  load(): SaveData | null {
    try {
      const saveString = localStorage.getItem(this.SAVE_KEY);
      
      if (!saveString) {
        console.log('No save data found');
        return null;
      }

      const data = JSON.parse(saveString) as SaveData;
      
      // Check version compatibility
      if (data.version !== this.SAVE_VERSION) {
        console.warn('Save version mismatch. Migration may be needed.');
        // Could implement migration logic here
      }

      console.log('Game loaded successfully');
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if save exists
   */
  hasSaveData(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /**
   * Delete save data
   */
  deleteSave(): boolean {
    try {
      localStorage.removeItem(this.SAVE_KEY);
      console.log('Save data deleted');
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Export save to file
   */
  exportSave(): string | null {
    try {
      const saveString = localStorage.getItem(this.SAVE_KEY);
      if (!saveString) {
        return null;
      }

      // Create downloadable blob
      const blob = new Blob([saveString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = `fantasy_mmo_save_${Date.now()}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      
      console.log('Save exported successfully');
      return saveString;
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  /**
   * Import save from file
   */
  async importSave(file: File): Promise<boolean> {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as SaveData;
      
      // Validate save data
      if (!data.version || !data.player) {
        throw new Error('Invalid save file format');
      }

      // Save imported data
      return this.save(data);
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  }

  /**
   * Create new save from current game state
   */
  createSaveFromState(
    playerId: string,
    position: { x: number; y: number; z: number },
    stats: Record<string, unknown>,
    inventory: Array<{ itemId: string; count: number }>,
    quests: unknown[],
    settings: Record<string, unknown>
  ): SaveData {
    return {
      version: this.SAVE_VERSION,
      timestamp: Date.now(),
      player: {
        id: playerId,
        position,
        stats: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          health: (stats as any).health || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          maxHealth: (stats as any).maxHealth || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          mana: (stats as any).mana || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          maxMana: (stats as any).maxMana || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          stamina: (stats as any).stamina || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          maxStamina: (stats as any).maxStamina || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          level: (stats as any).level || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          experience: (stats as any).experience || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          experienceToNext: (stats as any).experienceToNext || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          strength: (stats as any).strength || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dexterity: (stats as any).dexterity || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          intelligence: (stats as any).intelligence || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          vitality: (stats as any).vitality || 0
        },
        inventory: inventory,
        equipment: {}
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      quests: quests.map((q: any) => ({
        id: q.id,
        status: q.status,
        progress: {}
      })),
      world: {
        discoveredBiomes: [],
        visitedLocations: []
      },
      settings: settings as { musicVolume: number; sfxVolume: number; graphics: string }
    };
  }

  /**
   * Enable auto-save
   */
  enableAutoSave(saveCallback: () => SaveData) {
    if (this.autoSaveInterval) {
      return; // Already enabled
    }

    this.autoSaveInterval = window.setInterval(() => {
      const data = saveCallback();
      this.save(data);
      console.log('Auto-save completed');
    }, this.AUTO_SAVE_INTERVAL);

    console.log('Auto-save enabled');
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('Auto-save disabled');
    }
  }

  /**
   * Get save info without loading full data
   */
  getSaveInfo(): { timestamp: number; level: number; playtime: number } | null {
    try {
      const saveString = localStorage.getItem(this.SAVE_KEY);
      if (!saveString) return null;

      const data = JSON.parse(saveString) as SaveData;
      return {
        timestamp: data.timestamp,
        level: data.player.stats.level,
        playtime: 0 // Could track this in save data
      };
    } catch {
      return null;
    }
  }

  /**
   * Get available storage space
   */
  getStorageInfo(): { used: number; total: number } {
    try {
      const saveString = localStorage.getItem(this.SAVE_KEY) || '';
      const used = new Blob([saveString]).size;
      const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
      
      return { used, total };
    } catch {
      return { used: 0, total: 0 };
    }
  }
}
