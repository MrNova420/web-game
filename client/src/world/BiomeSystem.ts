import * as THREE from 'three';

export interface BiomeConfig {
  name: string;
  color: number;
  heightModifier: number;
  vegetationDensity: {
    trees: number;
    bushes: number;
    rocks: number;
  };
  grassDensity: number; // 0.0 to 1.0
  waterLevel: number;
}

export class BiomeSystem {
  private biomes: Map<string, BiomeConfig>;

  constructor() {
    this.biomes = new Map();
    this.initializeBiomes();
  }

  private initializeBiomes() {
    // Forest Biome - lush green, many trees
    // REDUCED vegetation for better performance
    this.biomes.set('forest', {
      name: 'Forest',
      color: 0x2d5016, // Dark green
      heightModifier: 1.0,
      vegetationDensity: {
        trees: 4,  // REDUCED from 12
        bushes: 5, // REDUCED from 15
        rocks: 2   // REDUCED from 3
      },
      grassDensity: 0.6, // REDUCED from 0.8
      waterLevel: 0
    });

    // Mountain Biome - rocky, high altitude
    this.biomes.set('mountain', {
      name: 'Mountain',
      color: 0x808080, // Gray rock
      heightModifier: 2.5,
      vegetationDensity: {
        trees: 0,  // REDUCED from 1
        bushes: 1, // REDUCED from 2
        rocks: 6   // REDUCED from 15
      },
      grassDensity: 0.1, // REDUCED from 0.2
      waterLevel: 0
    });

    // Plains/Grassland Biome - light green, open
    this.biomes.set('plains', {
      name: 'Plains',
      color: 0x7ec850, // Light green
      heightModifier: 0.3,
      vegetationDensity: {
        trees: 1,  // REDUCED from 2
        bushes: 3, // REDUCED from 8
        rocks: 2   // REDUCED from 4
      },
      grassDensity: 0.7, // REDUCED from 1.0
      waterLevel: 0
    });

    // Desert Biome - sandy, arid
    this.biomes.set('desert', {
      name: 'Desert',
      color: 0xedc9af, // Sandy tan
      heightModifier: 0.5,
      vegetationDensity: {
        trees: 0,
        bushes: 0,  // REDUCED from 1
        rocks: 3    // REDUCED from 8
      },
      grassDensity: 0.0, // No grass in desert
      waterLevel: 0
    });

    // Swamp Biome - dark, muddy
    this.biomes.set('swamp', {
      name: 'Swamp',
      color: 0x4a5d23, // Muddy dark green
      heightModifier: 0.2,
      vegetationDensity: {
        trees: 2,  // REDUCED from 5
        bushes: 4, // REDUCED from 10
        rocks: 1   // REDUCED from 2
      },
      grassDensity: 0.4, // REDUCED from 0.6
      waterLevel: -1 // Slightly below ground
    });

    // Tundra/Snow Biome - white, cold
    this.biomes.set('tundra', {
      name: 'Tundra',
      color: 0xe0f0f0, // Light blue-white
      heightModifier: 0.4,
      vegetationDensity: {
        trees: 0,  // REDUCED from 1
        bushes: 1, // REDUCED from 2
        rocks: 4   // REDUCED from 10
      },
      grassDensity: 0.05, // REDUCED from 0.1
      waterLevel: 0
    });

    // Mystical/Magical Biome - purple, ethereal
    this.biomes.set('mystical', {
      name: 'Mystical',
      color: 0x9b59b6, // Purple
      heightModifier: 1.2,
      vegetationDensity: {
        trees: 3,  // REDUCED from 6
        bushes: 4, // REDUCED from 8
        rocks: 2   // REDUCED from 5
      },
      grassDensity: 0.5, // REDUCED from 0.7
      waterLevel: 0
    });
  }

  getBiome(biomeName: string): BiomeConfig | undefined {
    return this.biomes.get(biomeName);
  }

  getBiomeColor(biomeName: string): number {
    const biome = this.biomes.get(biomeName);
    return biome ? biome.color : 0x3a9d23; // Default green
  }

  getBiomeHeightModifier(biomeName: string): number {
    const biome = this.biomes.get(biomeName);
    return biome ? biome.heightModifier : 1.0;
  }

  getVegetationDensity(biomeName: string): { trees: number; bushes: number; rocks: number } {
    const biome = this.biomes.get(biomeName);
    return biome ? biome.vegetationDensity : { trees: 5, bushes: 8, rocks: 5 };
  }

  getGrassDensity(biomeName: string): number {
    const biome = this.biomes.get(biomeName);
    return biome ? biome.grassDensity : 0.5;
  }

  getAllBiomes(): string[] {
    return Array.from(this.biomes.keys());
  }
}
