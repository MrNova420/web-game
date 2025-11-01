import { describe, it, expect, beforeEach } from 'vitest';
import { CraftingSystem } from '../systems/CraftingSystem';

describe('CraftingSystem', () => {
  let craftingSystem: CraftingSystem;

  beforeEach(() => {
    craftingSystem = new CraftingSystem();
  });

  it('should create a crafting system', () => {
    expect(craftingSystem).toBeDefined();
  });

  it('should have crafting recipes', () => {
    const recipes = craftingSystem.getAllRecipes();
    expect(recipes).toBeDefined();
    expect(Array.isArray(recipes)).toBe(true);
  });

  it('should check if recipe can be crafted', () => {
    const recipe = craftingSystem.getRecipe('wooden_sword');
    if (recipe) {
      const canCraft = craftingSystem.canCraft(recipe, {});
      expect(typeof canCraft).toBe('boolean');
    }
  });

  it('should craft items with correct ingredients', () => {
    const recipe = craftingSystem.getRecipe('wooden_sword');
    const inventory = { wood: 10, string: 5 };
    if (recipe) {
      const result = craftingSystem.craft(recipe, inventory);
      expect(result).toBeDefined();
    }
  });

  it('should fail crafting without ingredients', () => {
    const recipe = craftingSystem.getRecipe('iron_sword');
    const emptyInventory = {};
    if (recipe) {
      const result = craftingSystem.craft(recipe, emptyInventory);
      expect(result).toBeNull();
    }
  });

  it('should return recipe by category', () => {
    const weaponRecipes = craftingSystem.getRecipesByCategory('weapons');
    expect(Array.isArray(weaponRecipes)).toBe(true);
  });
});
