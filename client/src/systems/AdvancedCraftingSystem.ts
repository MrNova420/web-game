import * as THREE from 'three';

/**
 * AdvancedCraftingSystem - Professional crafting and recipe system
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Crafting Systems
 * Recipe management, crafting stations, skill progression
 */

type CraftingCategory = 'weapon' | 'armor' | 'tool' | 'consumable' | 'building' | 'misc';
type CraftingStation = 'workbench' | 'forge' | 'alchemy' | 'enchanting' | 'cooking' | 'none';

interface CraftingIngredient {
  itemId: string;
  quantity: number;
}

interface CraftingRecipe {
  id: string;
  name: string;
  category: CraftingCategory;
  station: CraftingStation;
  ingredients: CraftingIngredient[];
  result: {
    itemId: string;
    quantity: number;
  };
  craftTime: number; // seconds
  skillRequired: number;
  experience: number;
  unlocked: boolean;
}

interface CraftingSkill {
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
}

export class AdvancedCraftingSystem {
  private recipes = new Map<string, CraftingRecipe>();
  private skills = new Map<CraftingCategory, CraftingSkill>();
  private craftingQueue: { recipe: CraftingRecipe; progress: number }[] = [];
  
  // Callbacks
  private onCraftStarted: ((recipe: CraftingRecipe) => void) | null = null;
  private onCraftCompleted: ((recipe: CraftingRecipe) => void) | null = null;
  private onSkillLevelUp: ((skill: CraftingSkill) => void) | null = null;
  
  constructor() {
    this.initializeSkills();
    this.setupDefaultRecipes();
    console.log('[AdvancedCraftingSystem] Initialized');
  }
  
  /**
   * Initialize crafting skills
   */
  private initializeSkills(): void {
    const categories: CraftingCategory[] = ['weapon', 'armor', 'tool', 'consumable', 'building', 'misc'];
    
    categories.forEach(category => {
      this.skills.set(category, {
        name: category,
        level: 1,
        experience: 0,
        experienceToNext: 100
      });
    });
  }
  
  /**
   * Setup default recipes
   */
  private setupDefaultRecipes(): void {
    // Basic tools
    this.addRecipe({
      id: 'wooden_pickaxe',
      name: 'Wooden Pickaxe',
      category: 'tool',
      station: 'workbench',
      ingredients: [
        { itemId: 'wood', quantity: 10 },
        { itemId: 'stone', quantity: 5 }
      ],
      result: { itemId: 'wooden_pickaxe', quantity: 1 },
      craftTime: 5,
      skillRequired: 1,
      experience: 25,
      unlocked: true
    });
    
    this.addRecipe({
      id: 'stone_axe',
      name: 'Stone Axe',
      category: 'tool',
      station: 'workbench',
      ingredients: [
        { itemId: 'wood', quantity: 8 },
        { itemId: 'stone', quantity: 10 }
      ],
      result: { itemId: 'stone_axe', quantity: 1 },
      craftTime: 5,
      skillRequired: 1,
      experience: 25,
      unlocked: true
    });
    
    // Weapons
    this.addRecipe({
      id: 'iron_sword',
      name: 'Iron Sword',
      category: 'weapon',
      station: 'forge',
      ingredients: [
        { itemId: 'iron_ingot', quantity: 5 },
        { itemId: 'wood', quantity: 2 }
      ],
      result: { itemId: 'iron_sword', quantity: 1 },
      craftTime: 10,
      skillRequired: 5,
      experience: 50,
      unlocked: false
    });
    
    // Armor
    this.addRecipe({
      id: 'leather_armor',
      name: 'Leather Armor',
      category: 'armor',
      station: 'workbench',
      ingredients: [
        { itemId: 'leather', quantity: 15 }
      ],
      result: { itemId: 'leather_armor', quantity: 1 },
      craftTime: 8,
      skillRequired: 3,
      experience: 40,
      unlocked: true
    });
    
    // Consumables
    this.addRecipe({
      id: 'health_potion',
      name: 'Health Potion',
      category: 'consumable',
      station: 'alchemy',
      ingredients: [
        { itemId: 'herb_red', quantity: 3 },
        { itemId: 'water', quantity: 1 }
      ],
      result: { itemId: 'health_potion', quantity: 1 },
      craftTime: 3,
      skillRequired: 2,
      experience: 15,
      unlocked: true
    });
    
    console.log(`[AdvancedCraftingSystem] Loaded ${this.recipes.size} recipes`);
  }
  
  /**
   * Add recipe
   */
  addRecipe(recipe: CraftingRecipe): void {
    this.recipes.set(recipe.id, recipe);
  }
  
  /**
   * Start crafting
   */
  craftItem(recipeId: string, inventory: any): boolean {
    const recipe = this.recipes.get(recipeId);
    if (!recipe) {
      console.warn(`[AdvancedCraftingSystem] Recipe not found: ${recipeId}`);
      return false;
    }
    
    if (!recipe.unlocked) {
      console.warn(`[AdvancedCraftingSystem] Recipe locked: ${recipeId}`);
      return false;
    }
    
    // Check skill level
    const skill = this.skills.get(recipe.category);
    if (!skill || skill.level < recipe.skillRequired) {
      console.warn(`[AdvancedCraftingSystem] Insufficient skill level`);
      return false;
    }
    
    // Check ingredients
    for (const ingredient of recipe.ingredients) {
      if (!inventory.hasItem(ingredient.itemId, ingredient.quantity)) {
        console.warn(`[AdvancedCraftingSystem] Missing ingredient: ${ingredient.itemId}`);
        return false;
      }
    }
    
    // Remove ingredients
    for (const ingredient of recipe.ingredients) {
      inventory.removeItem(ingredient.itemId, ingredient.quantity);
    }
    
    // Add to crafting queue
    this.craftingQueue.push({
      recipe,
      progress: 0
    });
    
    console.log(`[AdvancedCraftingSystem] Started crafting: ${recipe.name}`);
    
    if (this.onCraftStarted) {
      this.onCraftStarted(recipe);
    }
    
    return true;
  }
  
  /**
   * Update crafting progress
   */
  update(deltaTime: number, inventory: any): void {
    if (this.craftingQueue.length === 0) return;
    
    const current = this.craftingQueue[0];
    current.progress += deltaTime;
    
    if (current.progress >= current.recipe.craftTime) {
      this.completeCraft(current.recipe, inventory);
      this.craftingQueue.shift();
    }
  }
  
  /**
   * Complete craft
   */
  private completeCraft(recipe: CraftingRecipe, inventory: any): void {
    // Add result to inventory
    inventory.addItem({ id: recipe.result.itemId }, recipe.result.quantity);
    
    // Add experience
    this.addExperience(recipe.category, recipe.experience);
    
    console.log(`[AdvancedCraftingSystem] Completed: ${recipe.name}`);
    
    if (this.onCraftCompleted) {
      this.onCraftCompleted(recipe);
    }
  }
  
  /**
   * Add crafting experience
   */
  addExperience(category: CraftingCategory, amount: number): void {
    const skill = this.skills.get(category);
    if (!skill) return;
    
    skill.experience += amount;
    
    // Check for level up
    while (skill.experience >= skill.experienceToNext) {
      skill.experience -= skill.experienceToNext;
      skill.level++;
      skill.experienceToNext = Math.floor(skill.experienceToNext * 1.5);
      
      console.log(`[AdvancedCraftingSystem] ${category} leveled up to ${skill.level}!`);
      
      // Unlock recipes
      this.unlockRecipesForLevel(category, skill.level);
      
      if (this.onSkillLevelUp) {
        this.onSkillLevelUp(skill);
      }
    }
  }
  
  /**
   * Unlock recipes for skill level
   */
  private unlockRecipesForLevel(category: CraftingCategory, level: number): void {
    let unlocked = 0;
    this.recipes.forEach(recipe => {
      if (recipe.category === category && 
          !recipe.unlocked && 
          recipe.skillRequired <= level) {
        recipe.unlocked = true;
        unlocked++;
        console.log(`[AdvancedCraftingSystem] Unlocked recipe: ${recipe.name}`);
      }
    });
    
    if (unlocked > 0) {
      console.log(`[AdvancedCraftingSystem] Unlocked ${unlocked} new recipes!`);
    }
  }
  
  /**
   * Get available recipes
   */
  getAvailableRecipes(category?: CraftingCategory): CraftingRecipe[] {
    const recipes = Array.from(this.recipes.values())
      .filter(r => r.unlocked);
    
    if (category) {
      return recipes.filter(r => r.category === category);
    }
    
    return recipes;
  }
  
  /**
   * Get recipe by station
   */
  getRecipesByStation(station: CraftingStation): CraftingRecipe[] {
    return Array.from(this.recipes.values())
      .filter(r => r.station === station && r.unlocked);
  }
  
  /**
   * Get skill
   */
  getSkill(category: CraftingCategory): CraftingSkill | undefined {
    return this.skills.get(category);
  }
  
  /**
   * Get all skills
   */
  getAllSkills(): CraftingSkill[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * Get crafting progress
   */
  getCraftingProgress(): number {
    if (this.craftingQueue.length === 0) return 0;
    const current = this.craftingQueue[0];
    return (current.progress / current.recipe.craftTime) * 100;
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    totalRecipes: number;
    unlockedRecipes: number;
    queueLength: number;
    skills: { category: string; level: number }[];
  } {
    return {
      totalRecipes: this.recipes.size,
      unlockedRecipes: Array.from(this.recipes.values()).filter(r => r.unlocked).length,
      queueLength: this.craftingQueue.length,
      skills: Array.from(this.skills.values()).map(s => ({
        category: s.name,
        level: s.level
      }))
    };
  }
  
  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onCraftStarted?: (recipe: CraftingRecipe) => void;
    onCraftCompleted?: (recipe: CraftingRecipe) => void;
    onSkillLevelUp?: (skill: CraftingSkill) => void;
  }): void {
    if (callbacks.onCraftStarted) this.onCraftStarted = callbacks.onCraftStarted;
    if (callbacks.onCraftCompleted) this.onCraftCompleted = callbacks.onCraftCompleted;
    if (callbacks.onSkillLevelUp) this.onSkillLevelUp = callbacks.onSkillLevelUp;
  }
}
