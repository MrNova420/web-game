import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';

/**
 * Item definition using ONLY real prop models from Fantasy_Props_MegaKit
 */
export interface GameItem {
  id: string;
  name: string;
  modelPath: string;
  type: 'weapon' | 'tool' | 'potion' | 'resource' | 'key' | 'misc';
  stackable: boolean;
  maxStack?: number;
}

/**
 * InventorySystem - Manages items using ONLY real prop models
 * Uses Fantasy_Props_MegaKit OBJ models for all items
 */
export class InventorySystem {
  private assetLoader: AssetLoader;
  private itemDatabase = new Map<string, GameItem>();
  private playerInventories = new Map<string, Map<string, { item: GameItem; count: number }>>();

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.initializeItemDatabase();
  }

  /**
   * Initialize item database with real prop models
   */
  private initializeItemDatabase() {
    // Weapons
    this.registerItem({
      id: 'pickaxe_bronze',
      name: 'Bronze Pickaxe',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Pickaxe_Bronze.obj',
      type: 'tool',
      stackable: false
    });

    // Resources
    this.registerItem({
      id: 'coin',
      name: 'Coin',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Coin.obj',
      type: 'resource',
      stackable: true,
      maxStack: 999
    });

    this.registerItem({
      id: 'coin_pile',
      name: 'Coin Pile',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Coin_Pile.obj',
      type: 'resource',
      stackable: true,
      maxStack: 99
    });

    // Potions
    this.registerItem({
      id: 'potion_health',
      name: 'Health Potion',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Potion_4.obj',
      type: 'potion',
      stackable: true,
      maxStack: 20
    });

    // Keys
    this.registerItem({
      id: 'key_gold',
      name: 'Golden Key',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Key_Gold.obj',
      type: 'key',
      stackable: false
    });

    this.registerItem({
      id: 'key_metal',
      name: 'Metal Key',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Key_Metal.obj',
      type: 'key',
      stackable: false
    });

    // Misc items
    this.registerItem({
      id: 'bag',
      name: 'Bag',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Bag.obj',
      type: 'misc',
      stackable: false
    });

    this.registerItem({
      id: 'pouch_large',
      name: 'Large Pouch',
      modelPath: '/extracted_assets/Fantasy_Props_MegaKit/Exports/OBJ/Pouch_Large.obj',
      type: 'misc',
      stackable: false
    });

    console.log(`Initialized inventory with ${this.itemDatabase.size} items`);
  }

  /**
   * Register a new item
   */
  private registerItem(item: GameItem) {
    this.itemDatabase.set(item.id, item);
  }

  /**
   * Create inventory for a player
   */
  createInventory(playerId: string) {
    if (!this.playerInventories.has(playerId)) {
      this.playerInventories.set(playerId, new Map());
      console.log(`Created inventory for player ${playerId}`);
    }
  }

  /**
   * Add item to player inventory
   */
  addItem(playerId: string, itemId: string, count: number = 1): boolean {
    const inventory = this.playerInventories.get(playerId);
    if (!inventory) {
      console.error('Player inventory not found:', playerId);
      return false;
    }

    const item = this.itemDatabase.get(itemId);
    if (!item) {
      console.error('Item not found:', itemId);
      return false;
    }

    const existingSlot = inventory.get(itemId);
    
    if (existingSlot) {
      if (item.stackable) {
        const maxStack = item.maxStack || 99;
        const newCount = Math.min(existingSlot.count + count, maxStack);
        existingSlot.count = newCount;
        console.log(`Added ${count} ${item.name} to inventory`);
        return true;
      } else {
        console.warn('Item is not stackable:', item.name);
        return false;
      }
    } else {
      inventory.set(itemId, { item, count });
      console.log(`Added ${item.name} to inventory`);
      return true;
    }
  }

  /**
   * Remove item from inventory
   */
  removeItem(playerId: string, itemId: string, count: number = 1): boolean {
    const inventory = this.playerInventories.get(playerId);
    if (!inventory) return false;

    const slot = inventory.get(itemId);
    if (!slot) return false;

    if (slot.count <= count) {
      inventory.delete(itemId);
    } else {
      slot.count -= count;
    }

    return true;
  }

  /**
   * Get item from database
   */
  getItem(itemId: string): GameItem | undefined {
    return this.itemDatabase.get(itemId);
  }

  /**
   * Get player inventory
   */
  getInventory(playerId: string): Map<string, { item: GameItem; count: number }> | undefined {
    return this.playerInventories.get(playerId);
  }

  /**
   * Spawn item model in world
   */
  async spawnItemInWorld(itemId: string, position: THREE.Vector3, scene: THREE.Scene): Promise<THREE.Object3D | null> {
    const item = this.itemDatabase.get(itemId);
    if (!item) {
      console.error('Item not found:', itemId);
      return null;
    }

    try {
      const itemModel = await this.assetLoader.loadModel(item.modelPath);
      itemModel.position.copy(position);
      itemModel.scale.set(1, 1, 1);
      scene.add(itemModel);
      console.log(`Spawned ${item.name} in world at`, position);
      return itemModel;
    } catch (error) {
      console.error('Failed to spawn item:', error);
      return null;
    }
  }
}
