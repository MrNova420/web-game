import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Crafting recipe definition
 */
export interface CraftingRecipe {
  id: string;
  name: string;
  resultItem: string;
  resultCount: number;
  ingredients: { itemId: string; count: number }[];
  stationType: 'workbench' | 'anvil' | 'none';
  craftTime: number; // seconds
}

/**
 * CraftingSystem - Manages crafting using ONLY real crafting station models
 * Uses Fantasy_Props_MegaKit OBJ models for workbenches, anvils
 */
export class CraftingSystem {
  private assetLoader: AssetLoader;
  private recipes = new Map<string, CraftingRecipe>();
  private craftingStations = new Map<string, THREE.Object3D>();
  
  // Crafting station model paths
  private stationModels = {
    workbench: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Workbench.obj',
    workbench_drawers: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Workbench_Drawers.obj',
    anvil: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Anvil.obj',
    anvil_log: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Anvil_Log.obj'
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.initializeRecipes();
  }

  /**
   * Initialize crafting recipes
   */
  private initializeRecipes() {
    // Tools
    this.registerRecipe({
      id: 'bronze_pickaxe',
      name: 'Bronze Pickaxe',
      resultItem: 'pickaxe_bronze',
      resultCount: 1,
      ingredients: [
        { itemId: 'bronze_ingot', count: 3 },
        { itemId: 'wood', count: 2 }
      ],
      stationType: 'anvil',
      craftTime: 5
    });

    this.registerRecipe({
      id: 'bronze_axe',
      name: 'Bronze Axe',
      resultItem: 'axe_bronze',
      resultCount: 1,
      ingredients: [
        { itemId: 'bronze_ingot', count: 2 },
        { itemId: 'wood', count: 1 }
      ],
      stationType: 'anvil',
      craftTime: 5
    });

    // Furniture
    this.registerRecipe({
      id: 'workbench',
      name: 'Workbench',
      resultItem: 'workbench',
      resultCount: 1,
      ingredients: [
        { itemId: 'wood', count: 10 }
      ],
      stationType: 'none',
      craftTime: 10
    });

    this.registerRecipe({
      id: 'wooden_chest',
      name: 'Wooden Chest',
      resultItem: 'chest_wooden',
      resultCount: 1,
      ingredients: [
        { itemId: 'wood', count: 8 }
      ],
      stationType: 'workbench',
      craftTime: 5
    });

    // Potions
    this.registerRecipe({
      id: 'health_potion',
      name: 'Health Potion',
      resultItem: 'potion_health',
      resultCount: 1,
      ingredients: [
        { itemId: 'herb_red', count: 2 },
        { itemId: 'water', count: 1 }
      ],
      stationType: 'workbench',
      craftTime: 3
    });

    console.log(`Initialized ${this.recipes.size} crafting recipes`);
  }

  /**
   * Register a recipe
   */
  private registerRecipe(recipe: CraftingRecipe) {
    this.recipes.set(recipe.id, recipe);
  }

  /**
   * Place crafting station in world
   */
  async placeCraftingStation(
    id: string,
    type: keyof typeof this.stationModels,
    position: THREE.Vector3,
    scene: THREE.Scene
  ): Promise<THREE.Object3D> {
    try {
      const modelPath = this.stationModels[type];
      const station = await this.assetLoader.loadModel(modelPath);
      
      station.position.copy(position);
      station.scale.set(1, 1, 1);
      station.userData.stationType = type.includes('workbench') ? 'workbench' : 'anvil';
      station.userData.id = id;
      
      scene.add(station);
      this.craftingStations.set(id, station);
      
      console.log(`Placed ${type} crafting station at`, position);
      return station;
      
    } catch (error) {
      console.error('Failed to place crafting station:', error);
      throw error;
    }
  }

  /**
   * Check if player can craft recipe
   */
  canCraft(recipeId: string, playerInventory: Map<string, number>): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) return false;

    // Check all ingredients
    for (const ingredient of recipe.ingredients) {
      const playerAmount = playerInventory.get(ingredient.itemId) || 0;
      if (playerAmount < ingredient.count) {
        return false;
      }
    }

    return true;
  }

  /**
   * Craft item
   */
  craft(
    recipeId: string,
    playerInventory: Map<string, number>,
    nearStation: boolean = false
  ): { success: boolean; error?: string } {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      return { success: false, error: 'Recipe not found' };
    }

    // Check station requirement
    if (recipe.stationType !== 'none' && !nearStation) {
      return { success: false, error: `Requires ${recipe.stationType}` };
    }

    // Check ingredients
    if (!this.canCraft(recipeId, playerInventory)) {
      return { success: false, error: 'Insufficient materials' };
    }

    // Consume ingredients
    for (const ingredient of recipe.ingredients) {
      const current = playerInventory.get(ingredient.itemId) || 0;
      playerInventory.set(ingredient.itemId, current - ingredient.count);
    }

    // Add result
    const current = playerInventory.get(recipe.resultItem) || 0;
    playerInventory.set(recipe.resultItem, current + recipe.resultCount);

    console.log(`Crafted ${recipe.name}`);
    return { success: true };
  }

  /**
   * Get all recipes
   */
  getAllRecipes(): CraftingRecipe[] {
    return Array.from(this.recipes.values());
  }

  /**
   * Get recipes by station type
   */
  getRecipesByStation(stationType: string): CraftingRecipe[] {
    return Array.from(this.recipes.values()).filter(r => r.stationType === stationType);
  }

  /**
   * Get recipe
   */
  getRecipe(recipeId: string): CraftingRecipe | undefined {
    return this.recipes.get(recipeId);
  }

  /**
   * Remove crafting station
   */
  removeCraftingStation(id: string, scene: THREE.Scene) {
    const station = this.craftingStations.get(id);
    if (station) {
      scene.remove(station);
      this.craftingStations.delete(id);
    }
  }
}
