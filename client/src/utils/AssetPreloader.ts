import { AssetLoader } from '../assets/AssetLoader';

/**
 * AssetPreloader - Preloads game assets in the background
 * Prevents lag when starting the game by loading critical assets early
 */
export class AssetPreloader {
  private assetLoader: AssetLoader;
  private preloadedAssets: Set<string> = new Set();
  private totalAssets: number = 0;
  private loadedAssets: number = 0;
  private onProgressCallback: ((progress: number, message: string) => void) | null = null;

  // Critical assets that should be preloaded
  private criticalAssets = {
    // Terrain and environment
    trees: [
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_1.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_2.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/CommonTree_3.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/PineTree_1.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/PineTree_2.obj'
    ],
    rocks: [
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_1.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_2.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_3.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Rock_4.obj'
    ],
    grass: [
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Grass_1.obj',
      '../extracted_assets/Stylized_Nature_MegaKit/OBJ/Grass_2.obj'
    ],
    // Buildings (for initial spawn area)
    buildings: [
      '../extracted_assets/Medieval_Village_MegaKit/OBJ/House_1.obj',
      '../extracted_assets/Medieval_Village_MegaKit/OBJ/House_2.obj',
      '../extracted_assets/Medieval_Village_MegaKit/OBJ/Tower_1.obj'
    ],
    // Characters
    characters: [
      '../extracted_assets/Universal_Base_Characters/Male_1.obj',
      '../extracted_assets/Universal_Base_Characters/Female_1.obj'
    ],
    // NPCs
    npcs: [
      '../extracted_assets/KayKit_Adventurers/Adventurer_1.obj',
      '../extracted_assets/KayKit_Adventurers/Adventurer_2.obj'
    ],
    // Enemies
    enemies: [
      '../extracted_assets/KayKit_Skeletons/Skeleton_1.obj',
      '../extracted_assets/KayKit_Skeletons/Skeleton_2.obj'
    ],
    // Props and items
    props: [
      '../extracted_assets/Fantasy_Props_MegaKit/OBJ/Sword_1.obj',
      '../extracted_assets/Fantasy_Props_MegaKit/OBJ/Shield_1.obj',
      '../extracted_assets/Fantasy_Props_MegaKit/OBJ/Chest_1.obj',
      '../extracted_assets/Fantasy_Props_MegaKit/OBJ/Potion_1.obj'
    ]
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  /**
   * Set progress callback
   */
  public onProgress(callback: (progress: number, message: string) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Preload all critical assets
   * This is called when the menu is shown, before the game starts
   */
  public async preloadCriticalAssets(): Promise<void> {
    console.log('[AssetPreloader] Starting background asset preload...');
    
    const allAssets = [
      ...this.criticalAssets.trees,
      ...this.criticalAssets.rocks,
      ...this.criticalAssets.grass,
      ...this.criticalAssets.buildings,
      ...this.criticalAssets.characters,
      ...this.criticalAssets.npcs,
      ...this.criticalAssets.enemies,
      ...this.criticalAssets.props
    ];

    this.totalAssets = allAssets.length;
    this.loadedAssets = 0;

    const categories = [
      { name: 'trees', assets: this.criticalAssets.trees, label: 'Loading trees' },
      { name: 'rocks', assets: this.criticalAssets.rocks, label: 'Loading rocks' },
      { name: 'grass', assets: this.criticalAssets.grass, label: 'Loading grass' },
      { name: 'buildings', assets: this.criticalAssets.buildings, label: 'Loading buildings' },
      { name: 'characters', assets: this.criticalAssets.characters, label: 'Loading characters' },
      { name: 'npcs', assets: this.criticalAssets.npcs, label: 'Loading NPCs' },
      { name: 'enemies', assets: this.criticalAssets.enemies, label: 'Loading enemies' },
      { name: 'props', assets: this.criticalAssets.props, label: 'Loading items' }
    ];

    for (const category of categories) {
      await this.preloadCategory(category.name, category.assets, category.label);
    }

    console.log('[AssetPreloader] ✓ All critical assets preloaded');
    this.updateProgress(100, 'Assets ready!');
  }

  /**
   * Preload a category of assets
   */
  private async preloadCategory(categoryName: string, assets: string[], label: string): Promise<void> {
    console.log(`[AssetPreloader] Preloading ${categoryName}...`);
    
    const promises = assets.map(async (assetPath) => {
      try {
        // Try to load the asset
        await this.assetLoader.loadModel(assetPath);
        this.preloadedAssets.add(assetPath);
        this.loadedAssets++;
        
        const progress = (this.loadedAssets / this.totalAssets) * 100;
        this.updateProgress(progress, `${label} (${this.loadedAssets}/${this.totalAssets})`);
        
        console.log(`[AssetPreloader] ✓ Loaded: ${assetPath}`);
      } catch (error) {
        // Asset doesn't exist, skip it
        console.warn(`[AssetPreloader] Asset not found (will use fallback): ${assetPath}`);
        this.loadedAssets++;
      }
    });

    await Promise.all(promises);
  }

  /**
   * Preload specific asset
   */
  public async preloadAsset(assetPath: string): Promise<void> {
    if (this.preloadedAssets.has(assetPath)) {
      return; // Already preloaded
    }

    try {
      await this.assetLoader.loadModel(assetPath);
      this.preloadedAssets.add(assetPath);
      console.log(`[AssetPreloader] ✓ Preloaded: ${assetPath}`);
    } catch (error) {
      console.warn(`[AssetPreloader] Failed to preload: ${assetPath}`, error);
    }
  }

  /**
   * Preload multiple assets
   */
  public async preloadAssets(assetPaths: string[]): Promise<void> {
    const promises = assetPaths.map(path => this.preloadAsset(path));
    await Promise.all(promises);
  }

  /**
   * Check if an asset is preloaded
   */
  public isPreloaded(assetPath: string): boolean {
    return this.preloadedAssets.has(assetPath);
  }

  /**
   * Get preload progress
   */
  public getProgress(): number {
    if (this.totalAssets === 0) return 0;
    return (this.loadedAssets / this.totalAssets) * 100;
  }

  /**
   * Get number of preloaded assets
   */
  public getPreloadedCount(): number {
    return this.preloadedAssets.size;
  }

  /**
   * Update progress
   */
  private updateProgress(progress: number, message: string): void {
    if (this.onProgressCallback) {
      this.onProgressCallback(progress, message);
    }
  }

  /**
   * Preload assets for a specific biome
   */
  public async preloadBiomeAssets(biome: string): Promise<void> {
    console.log(`[AssetPreloader] Preloading assets for biome: ${biome}`);
    
    const biomeAssets: { [key: string]: string[] } = {
      forest: this.criticalAssets.trees,
      desert: this.criticalAssets.rocks,
      plains: this.criticalAssets.grass,
      // Add more biome-specific assets as needed
    };

    const assets = biomeAssets[biome] || [];
    await this.preloadAssets(assets);
  }

  /**
   * Clear preloaded assets (for memory management)
   */
  public clear(): void {
    this.preloadedAssets.clear();
    this.loadedAssets = 0;
    this.totalAssets = 0;
    console.log('[AssetPreloader] Cleared all preloaded assets');
  }
}
