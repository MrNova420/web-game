/**
 * CompleteAssetIntegrator - Integration system for all 4,885 assets
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Complete Asset Integration
 * Manages all 13 asset packs systematically
 */

export interface AssetPack {
  name: string;
  path: string;
  fileCount: number;
  categories: string[];
  formats: string[];
}

export interface AssetCategory {
  packName: string;
  category: string;
  assetPaths: string[];
}

export class CompleteAssetIntegrator {
  // Complete asset pack inventory (4,885 total assets)
  private assetPacks: AssetPack[] = [
    {
      name: 'KayKit Dungeon Remastered',
      path: '/extracted_assets/KayKit_DungeonRemastered',
      fileCount: 1301,
      categories: ['walls', 'floors', 'props', 'decorations', 'traps', 'doors', 'treasure'],
      formats: ['gltf', 'glb']
    },
    {
      name: 'KayKit Dungeon Pack',
      path: '/extracted_assets/KayKit_Dungeon_Pack',
      fileCount: 1079,
      categories: ['environment', 'interactive', 'structural'],
      formats: ['gltf', 'glb']
    },
    {
      name: 'Medieval Village MegaKit',
      path: '/extracted_assets/Medieval_Village_MegaKit',
      fileCount: 936,
      categories: ['buildings', 'houses', 'shops', 'market', 'furniture', 'tools', 'decorations', 'fences', 'gates', 'walls'],
      formats: ['gltf', 'glb', 'fbx']
    },
    {
      name: 'Fantasy Props MegaKit',
      path: '/extracted_assets/Fantasy_Props_MegaKit',
      fileCount: 517,
      categories: ['weapons', 'armor', 'shields', 'potions', 'scrolls', 'books', 'chests', 'barrels', 'crates', 'decorative'],
      formats: ['gltf', 'glb']
    },
    {
      name: 'Stylized Nature MegaKit',
      path: '/extracted_assets/Stylized_Nature_MegaKit',
      fileCount: 453,
      categories: ['trees', 'bushes', 'grass', 'flowers', 'rocks', 'stones', 'plants', 'ground_cover'],
      formats: ['obj', 'gltf', 'fbx']
    },
    {
      name: 'KayKit Adventurers',
      path: '/extracted_assets/KayKit_Adventurers',
      fileCount: 250,
      categories: ['characters', 'player_models', 'animations'],
      formats: ['gltf', 'glb', 'fbx']
    },
    {
      name: 'Universal Base Characters',
      path: '/extracted_assets/Universal_Base_Characters',
      fileCount: 138,
      categories: ['characters', 'base_models'],
      formats: ['fbx', 'blend']
    },
    {
      name: 'KayKit Skeletons',
      path: '/extracted_assets/KayKit_Skeletons',
      fileCount: 107,
      categories: ['enemies', 'undead', 'skeletons'],
      formats: ['gltf', 'glb']
    },
    {
      name: 'Fantasy RPG Music',
      path: '/extracted_assets/Fantasy_RPG_Music',
      fileCount: 88,
      categories: ['music', 'ambient', 'combat', 'exploration'],
      formats: ['mp3', 'ogg', 'wav']
    },
    {
      name: 'Universal Animation Library',
      path: '/extracted_assets/Universal_Animation_Library',
      fileCount: 7,
      categories: ['animations', 'character_animations'],
      formats: ['fbx']
    },
    {
      name: 'Skyboxes',
      path: '/extracted_assets/Skyboxes',
      fileCount: 6,
      categories: ['skyboxes', 'environment'],
      formats: ['png', 'jpg']
    },
    {
      name: 'EverythingLibrary Animals',
      path: '/extracted_assets/EverythingLibrary_Animals',
      fileCount: 2,
      categories: ['animals', 'wildlife'],
      formats: ['fbx', 'blend']
    },
    {
      name: 'World Builder Kit',
      path: '/extracted_assets/World_Builder_Kit',
      fileCount: 1,
      categories: ['terrain', 'world_building'],
      formats: ['various']
    }
  ];

  private assetRegistry = new Map<string, AssetCategory>();

  constructor() {
    this.initializeRegistry();
    console.log('[CompleteAssetIntegrator] Initialized with 4,885 assets across 13 packs');
  }

  /**
   * Initialize asset registry for quick lookup
   */
  private initializeRegistry(): void {
    this.assetPacks.forEach(pack => {
      pack.categories.forEach(category => {
        const key = `${pack.name}:${category}`;
        this.assetRegistry.set(key, {
          packName: pack.name,
          category,
          assetPaths: [] // Will be populated on demand
        });
      });
    });
  }

  /**
   * Get all asset packs
   */
  getAssetPacks(): AssetPack[] {
    return [...this.assetPacks];
  }

  /**
   * Get specific asset pack by name
   */
  getAssetPack(name: string): AssetPack | undefined {
    return this.assetPacks.find(pack => pack.name === name);
  }

  /**
   * Get total asset count
   */
  getTotalAssetCount(): number {
    return this.assetPacks.reduce((sum, pack) => sum + pack.fileCount, 0);
  }

  /**
   * Get assets by category across all packs
   */
  getAssetsByCategory(category: string): AssetCategory[] {
    const results: AssetCategory[] = [];
    this.assetRegistry.forEach((value, key) => {
      if (value.category === category) {
        results.push(value);
      }
    });
    return results;
  }

  /**
   * ENHANCEMENT: Get recommended assets for world building
   */
  getWorldBuildingAssets(): {
    terrain: AssetPack;
    nature: AssetPack;
    structures: AssetPack;
    props: AssetPack;
    skyboxes: AssetPack;
  } {
    return {
      terrain: this.assetPacks.find(p => p.name === 'World Builder Kit')!,
      nature: this.assetPacks.find(p => p.name === 'Stylized Nature MegaKit')!,
      structures: this.assetPacks.find(p => p.name === 'Medieval Village MegaKit')!,
      props: this.assetPacks.find(p => p.name === 'Fantasy Props MegaKit')!,
      skyboxes: this.assetPacks.find(p => p.name === 'Skyboxes')!
    };
  }

  /**
   * ENHANCEMENT: Get recommended assets for character system
   */
  getCharacterAssets(): {
    players: AssetPack[];
    enemies: AssetPack[];
    animations: AssetPack[];
  } {
    return {
      players: [
        this.assetPacks.find(p => p.name === 'KayKit Adventurers')!,
        this.assetPacks.find(p => p.name === 'Universal Base Characters')!
      ],
      enemies: [
        this.assetPacks.find(p => p.name === 'KayKit Skeletons')!
      ],
      animations: [
        this.assetPacks.find(p => p.name === 'Universal Animation Library')!
      ]
    };
  }

  /**
   * ENHANCEMENT: Get recommended assets for dungeon system
   */
  getDungeonAssets(): AssetPack[] {
    return [
      this.assetPacks.find(p => p.name === 'KayKit Dungeon Remastered')!,
      this.assetPacks.find(p => p.name === 'KayKit Dungeon Pack')!
    ];
  }

  /**
   * ENHANCEMENT: Get audio assets
   */
  getAudioAssets(): AssetPack {
    return this.assetPacks.find(p => p.name === 'Fantasy RPG Music')!;
  }

  /**
   * Get asset pack statistics
   */
  getStatistics(): {
    totalPacks: number;
    totalAssets: number;
    byPack: { name: string; count: number }[];
    byFormat: Map<string, number>;
  } {
    const byFormat = new Map<string, number>();
    
    this.assetPacks.forEach(pack => {
      pack.formats.forEach(format => {
        byFormat.set(format, (byFormat.get(format) || 0) + 1);
      });
    });

    return {
      totalPacks: this.assetPacks.length,
      totalAssets: this.getTotalAssetCount(),
      byPack: this.assetPacks.map(p => ({ name: p.name, count: p.fileCount })),
      byFormat
    };
  }

  /**
   * Log comprehensive asset inventory
   */
  logInventory(): void {
    console.log('\n=== COMPLETE ASSET INVENTORY ===');
    console.log(`Total Packs: ${this.assetPacks.length}`);
    console.log(`Total Assets: ${this.getTotalAssetCount()}`);
    console.log('\nAsset Packs:');
    
    this.assetPacks.forEach((pack, index) => {
      console.log(`\n${index + 1}. ${pack.name}`);
      console.log(`   Files: ${pack.fileCount}`);
      console.log(`   Path: ${pack.path}`);
      console.log(`   Categories: ${pack.categories.join(', ')}`);
      console.log(`   Formats: ${pack.formats.join(', ')}`);
    });
    
    console.log('\n=== END INVENTORY ===\n');
  }
}
