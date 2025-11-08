/**
 * AdvancedSaveSystem - Professional save/load management
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Save Systems
 * Auto-save, cloud sync ready, compression
 */

interface SaveData {
  version: string;
  timestamp: number;
  playerData: {
    position: { x: number; y: number; z: number };
    rotation: number;
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
  };
  inventoryData: {
    slots: any[];
    gold: number;
    equipped: any;
  };
  questData: {
    activeQuests: string[];
    completedQuests: string[];
  };
  worldData: {
    seed: number;
    timeOfDay: number;
    weather: string;
  };
  settingsData: {
    graphics: any;
    audio: any;
    controls: any;
  };
}

export class AdvancedSaveSystem {
  private saveVersion = '1.0.0';
  private autoSaveInterval = 300000; // 5 minutes
  private lastAutoSave = 0;
  private autoSaveEnabled = true;
  
  // Save slots
  private maxSaveSlots = 10;
  private currentSlot = 0;
  
  // Callbacks
  private onSaveStarted: (() => void) | null = null;
  private onSaveCompleted: ((slot: number) => void) | null = null;
  private onLoadStarted: (() => void) | null = null;
  private onLoadCompleted: ((data: SaveData) => void) | null = null;
  
  constructor() {
    console.log('[AdvancedSaveSystem] Initialized');
  }
  
  /**
   * Save game to slot
   */
  async saveGame(slot: number, gameState: any): Promise<boolean> {
    try {
      if (this.onSaveStarted) this.onSaveStarted();
      
      const saveData: SaveData = {
        version: this.saveVersion,
        timestamp: Date.now(),
        playerData: {
          position: gameState.player.position,
          rotation: gameState.player.rotation,
          health: gameState.player.health,
          maxHealth: gameState.player.maxHealth,
          level: gameState.player.level,
          experience: gameState.player.experience
        },
        inventoryData: {
          slots: gameState.inventory.getAllItems(),
          gold: gameState.inventory.gold,
          equipped: gameState.inventory.getEquippedItems()
        },
        questData: {
          activeQuests: gameState.quests.getActiveQuests().map((q: any) => q.id),
          completedQuests: Array.from(gameState.quests.completedQuests)
        },
        worldData: {
          seed: gameState.world.seed,
          timeOfDay: gameState.world.timeOfDay,
          weather: gameState.world.weather
        },
        settingsData: {
          graphics: gameState.settings.graphics,
          audio: gameState.settings.audio,
          controls: gameState.settings.controls
        }
      };
      
      // Compress and save to localStorage
      const serialized = JSON.stringify(saveData);
      const compressed = this.compressData(serialized);
      
      localStorage.setItem(`save_slot_${slot}`, compressed);
      localStorage.setItem('last_save_slot', slot.toString());
      
      console.log(`[AdvancedSaveSystem] Game saved to slot ${slot}`);
      
      if (this.onSaveCompleted) this.onSaveCompleted(slot);
      
      return true;
    } catch (error) {
      console.error('[AdvancedSaveSystem] Save failed:', error);
      return false;
    }
  }
  
  /**
   * Load game from slot
   */
  async loadGame(slot: number): Promise<SaveData | null> {
    try {
      if (this.onLoadStarted) this.onLoadStarted();
      
      const compressed = localStorage.getItem(`save_slot_${slot}`);
      if (!compressed) {
        console.warn(`[AdvancedSaveSystem] No save found in slot ${slot}`);
        return null;
      }
      
      const serialized = this.decompressData(compressed);
      const saveData: SaveData = JSON.parse(serialized);
      
      // Version check
      if (saveData.version !== this.saveVersion) {
        console.warn(`[AdvancedSaveSystem] Save version mismatch: ${saveData.version} vs ${this.saveVersion}`);
        // Could implement migration here
      }
      
      console.log(`[AdvancedSaveSystem] Game loaded from slot ${slot}`);
      
      if (this.onLoadCompleted) this.onLoadCompleted(saveData);
      
      return saveData;
    } catch (error) {
      console.error('[AdvancedSaveSystem] Load failed:', error);
      return null;
    }
  }
  
  /**
   * Delete save slot
   */
  deleteSave(slot: number): boolean {
    try {
      localStorage.removeItem(`save_slot_${slot}`);
      console.log(`[AdvancedSaveSystem] Deleted save slot ${slot}`);
      return true;
    } catch (error) {
      console.error('[AdvancedSaveSystem] Delete failed:', error);
      return false;
    }
  }
  
  /**
   * Get all save slots info
   */
  getAllSaves(): Array<{ slot: number; timestamp: number; exists: boolean }> {
    const saves = [];
    
    for (let i = 0; i < this.maxSaveSlots; i++) {
      const compressed = localStorage.getItem(`save_slot_${i}`);
      
      if (compressed) {
        try {
          const serialized = this.decompressData(compressed);
          const saveData: SaveData = JSON.parse(serialized);
          saves.push({
            slot: i,
            timestamp: saveData.timestamp,
            exists: true
          });
        } catch {
          saves.push({ slot: i, timestamp: 0, exists: false });
        }
      } else {
        saves.push({ slot: i, timestamp: 0, exists: false });
      }
    }
    
    return saves;
  }
  
  /**
   * Auto-save
   */
  update(deltaTime: number, gameState: any): void {
    if (!this.autoSaveEnabled) return;
    
    const currentTime = Date.now();
    if (currentTime - this.lastAutoSave >= this.autoSaveInterval) {
      this.autoSave(gameState);
      this.lastAutoSave = currentTime;
    }
  }
  
  /**
   * Perform auto-save
   */
  private async autoSave(gameState: any): Promise<void> {
    const autoSaveSlot = 0; // Use slot 0 for auto-save
    await this.saveGame(autoSaveSlot, gameState);
    console.log('[AdvancedSaveSystem] Auto-save completed');
  }
  
  /**
   * Enable/disable auto-save
   */
  setAutoSave(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    console.log(`[AdvancedSaveSystem] Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Set auto-save interval
   */
  setAutoSaveInterval(seconds: number): void {
    this.autoSaveInterval = seconds * 1000;
    console.log(`[AdvancedSaveSystem] Auto-save interval set to ${seconds}s`);
  }
  
  /**
   * Compress data (simple implementation)
   */
  private compressData(data: string): string {
    // In production, would use actual compression (e.g., pako)
    return btoa(data);
  }
  
  /**
   * Decompress data
   */
  private decompressData(data: string): string {
    return atob(data);
  }
  
  /**
   * Export save to file
   */
  exportSave(slot: number): void {
    const compressed = localStorage.getItem(`save_slot_${slot}`);
    if (!compressed) {
      console.warn(`[AdvancedSaveSystem] No save to export in slot ${slot}`);
      return;
    }
    
    const blob = new Blob([compressed], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `save_slot_${slot}.sav`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log(`[AdvancedSaveSystem] Save exported from slot ${slot}`);
  }
  
  /**
   * Import save from file
   */
  async importSave(slot: number, file: File): Promise<boolean> {
    try {
      const text = await file.text();
      localStorage.setItem(`save_slot_${slot}`, text);
      console.log(`[AdvancedSaveSystem] Save imported to slot ${slot}`);
      return true;
    } catch (error) {
      console.error('[AdvancedSaveSystem] Import failed:', error);
      return false;
    }
  }
  
  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onSaveStarted?: () => void;
    onSaveCompleted?: (slot: number) => void;
    onLoadStarted?: () => void;
    onLoadCompleted?: (data: SaveData) => void;
  }): void {
    if (callbacks.onSaveStarted) this.onSaveStarted = callbacks.onSaveStarted;
    if (callbacks.onSaveCompleted) this.onSaveCompleted = callbacks.onSaveCompleted;
    if (callbacks.onLoadStarted) this.onLoadStarted = callbacks.onLoadStarted;
    if (callbacks.onLoadCompleted) this.onLoadCompleted = callbacks.onLoadCompleted;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    maxSlots: number;
    usedSlots: number;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
  } {
    const saves = this.getAllSaves();
    const usedSlots = saves.filter(s => s.exists).length;
    
    return {
      maxSlots: this.maxSaveSlots,
      usedSlots,
      autoSaveEnabled: this.autoSaveEnabled,
      autoSaveInterval: this.autoSaveInterval / 1000
    };
  }
}
