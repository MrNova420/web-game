/**
 * IntegrationManager - Coordinates all game systems
 * Central hub for system lifecycle and inter-system communication
 */
export class IntegrationManager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private systems: Map<string, any> = new Map();
  private eventBus: Map<string, Function[]> = new Map();
  private initOrder: string[] = [];
  private updateOrder: string[] = [];
  private disposed: boolean = false;
  
  constructor() {
    console.log('[IntegrationManager] Initializing...');
  }
  
  /**
   * Register a system with the manager
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerSystem(name: string, system: any, dependencies: string[] = []): void {
    if (this.systems.has(name)) {
      console.warn(`[IntegrationManager] System ${name} already registered`);
      return;
    }
    
    this.systems.set(name, system);
    
    // Calculate initialization order based on dependencies
    this.calculateInitOrder(name, dependencies);
    
    console.log(`[IntegrationManager] Registered system: ${name}`);
  }
  
  /**
   * Calculate initialization order based on dependencies
   */
  private calculateInitOrder(name: string, dependencies: string[]): void {
    // Add dependencies first if not already in order
    dependencies.forEach(dep => {
      if (!this.initOrder.includes(dep)) {
        this.initOrder.push(dep);
      }
    });
    
    // Add current system if not already in order
    if (!this.initOrder.includes(name)) {
      this.initOrder.push(name);
    }
    
    // Update order is same as init order
    this.updateOrder = [...this.initOrder];
  }
  
  /**
   * Initialize all systems in dependency order
   */
  public async initializeAll(): Promise<void> {
    console.log('[IntegrationManager] Initializing all systems...');
    
    for (const systemName of this.initOrder) {
      const system = this.systems.get(systemName);
      if (system && typeof system.initialize === 'function') {
        try {
          console.log(`[IntegrationManager] Initializing ${systemName}...`);
          await system.initialize();
          console.log(`[IntegrationManager] ✓ ${systemName} initialized`);
        } catch (error) {
          console.error(`[IntegrationManager] ✗ Failed to initialize ${systemName}:`, error);
          throw error;
        }
      }
    }
    
    console.log('[IntegrationManager] All systems initialized successfully!');
  }
  
  /**
   * Update all systems in order
   * PERFORMANCE FIX: Throttle non-critical systems to reduce frame load
   * Note: Performance monitor is updated separately in GameEngine with renderer/scene
   */
  private frameCount = 0;
  private lowFrequencySystems = new Set([
    'save', 'achievements', 'tutorial', 'minimap', 'weather', 
    'dungeon', 'environment', 'assetPool'
  ]);
  private skipInGeneralUpdate = new Set(['performance']);
  
  public updateAll(deltaTime: number): void {
    if (this.disposed) return;
    
    this.frameCount++;
    
    for (const systemName of this.updateOrder) {
      // Skip systems that need special handling
      if (this.skipInGeneralUpdate.has(systemName)) {
        continue;
      }
      
      const system = this.systems.get(systemName);
      if (system && typeof system.update === 'function') {
        try {
          // PERFORMANCE FIX: Only update low-priority systems every 5th frame (12 FPS)
          if (this.lowFrequencySystems.has(systemName)) {
            if (this.frameCount % 5 === 0) {
              system.update(deltaTime * 5); // Scale deltaTime accordingly
            }
          } else {
            system.update(deltaTime);
          }
        } catch (error) {
          console.error(`[IntegrationManager] Error updating ${systemName}:`, error);
        }
      }
    }
  }
  
  /**
   * Get a specific system
   */
  public getSystem<T>(name: string): T | null {
    return this.systems.get(name) as T || null;
  }
  
  /**
   * Check if system is registered
   */
  public hasSystem(name: string): boolean {
    return this.systems.has(name);
  }
  
  /**
   * Subscribe to an event
   */
  public on(eventName: string, callback: Function): void {
    if (!this.eventBus.has(eventName)) {
      this.eventBus.set(eventName, []);
    }
    this.eventBus.get(eventName)!.push(callback);
  }
  
  /**
   * Unsubscribe from an event
   */
  public off(eventName: string, callback: Function): void {
    if (!this.eventBus.has(eventName)) return;
    
    const callbacks = this.eventBus.get(eventName)!;
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  }
  
  /**
   * Emit an event to all subscribers
   */
  public emit(eventName: string, ...args: unknown[]): void {
    if (!this.eventBus.has(eventName)) return;
    
    const callbacks = this.eventBus.get(eventName)!;
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`[IntegrationManager] Error in event ${eventName} callback:`, error);
      }
    });
  }
  
  /**
   * Pause all systems
   */
  public pauseAll(): void {
    console.log('[IntegrationManager] Pausing all systems...');
    
    for (const [, system] of this.systems) {
      if (typeof system.pause === 'function') {
        system.pause();
      }
    }
  }
  
  /**
   * Resume all systems
   */
  public resumeAll(): void {
    console.log('[IntegrationManager] Resuming all systems...');
    
    for (const [, system] of this.systems) {
      if (typeof system.resume === 'function') {
        system.resume();
      }
    }
  }
  
  /**
   * Get statistics about all systems
   */
  public getStats(): Record<string, unknown> {
    const stats: Record<string, unknown> = {
      totalSystems: this.systems.size,
      systems: {}
    };
    
    for (const [name, system] of this.systems) {
      if (typeof system.getStats === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stats.systems as any)[name] = system.getStats();
      }
    }
    
    return stats;
  }
  
  /**
   * Dispose all systems in reverse order
   */
  public disposeAll(): void {
    if (this.disposed) return;
    
    console.log('[IntegrationManager] Disposing all systems...');
    
    // Dispose in reverse order
    const disposeOrder = [...this.initOrder].reverse();
    
    for (const systemName of disposeOrder) {
      const system = this.systems.get(systemName);
      if (system && typeof system.dispose === 'function') {
        try {
          console.log(`[IntegrationManager] Disposing ${systemName}...`);
          system.dispose();
          console.log(`[IntegrationManager] ✓ ${systemName} disposed`);
        } catch (error) {
          console.error(`[IntegrationManager] ✗ Failed to dispose ${systemName}:`, error);
        }
      }
    }
    
    this.systems.clear();
    this.eventBus.clear();
    this.disposed = true;
    
    console.log('[IntegrationManager] All systems disposed successfully!');
  }
}
