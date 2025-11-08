import * as THREE from 'three';

/**
 * AdvancedInventorySystem - Professional inventory management
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Inventory Systems
 * Item management, stacking, sorting, equipment slots
 */

type ItemType = 'weapon' | 'armor' | 'consumable' | 'resource' | 'quest' | 'misc';
type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type EquipSlot = 'head' | 'chest' | 'legs' | 'feet' | 'mainHand' | 'offHand' | 'accessory';

interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  value: number;
  weight: number;
  icon?: string;
  equipSlot?: EquipSlot;
  stats?: {
    damage?: number;
    defense?: number;
    health?: number;
    mana?: number;
    speed?: number;
  };
}

interface InventorySlot {
  item: Item | null;
  quantity: number;
  slotIndex: number;
}

export class AdvancedInventorySystem {
  private slots: InventorySlot[] = [];
  private maxSlots: number;
  private equipped = new Map<EquipSlot, Item>();
  
  // Weight system
  private maxWeight: number = 100;
  private currentWeight: number = 0;
  
  // Gold/currency
  private gold: number = 0;
  
  // Callbacks
  private onItemAdded: ((item: Item, quantity: number) => void) | null = null;
  private onItemRemoved: ((item: Item, quantity: number) => void) | null = null;
  private onItemEquipped: ((item: Item, slot: EquipSlot) => void) | null = null;
  
  constructor(maxSlots: number = 40) {
    this.maxSlots = maxSlots;
    
    // Initialize empty slots
    for (let i = 0; i < maxSlots; i++) {
      this.slots.push({
        item: null,
        quantity: 0,
        slotIndex: i
      });
    }
    
    console.log(`[AdvancedInventorySystem] Initialized with ${maxSlots} slots`);
  }
  
  /**
   * Add item to inventory
   */
  addItem(item: Item, quantity: number = 1): boolean {
    // Check weight limit
    const totalWeight = item.weight * quantity;
    if (this.currentWeight + totalWeight > this.maxWeight) {
      console.warn('[AdvancedInventorySystem] Inventory too heavy!');
      return false;
    }
    
    // If stackable, try to add to existing stack
    if (item.stackable) {
      for (const slot of this.slots) {
        if (slot.item && slot.item.id === item.id) {
          const spaceInStack = item.maxStack - slot.quantity;
          if (spaceInStack > 0) {
            const amountToAdd = Math.min(quantity, spaceInStack);
            slot.quantity += amountToAdd;
            quantity -= amountToAdd;
            this.currentWeight += item.weight * amountToAdd;
            
            console.log(`[AdvancedInventorySystem] Stacked ${amountToAdd}x ${item.name}`);
            
            if (quantity === 0) {
              if (this.onItemAdded) this.onItemAdded(item, amountToAdd);
              return true;
            }
          }
        }
      }
    }
    
    // Find empty slots
    while (quantity > 0) {
      const emptySlot = this.slots.find(s => s.item === null);
      if (!emptySlot) {
        console.warn('[AdvancedInventorySystem] Inventory full!');
        return false;
      }
      
      const amountToAdd = item.stackable ? Math.min(quantity, item.maxStack) : 1;
      emptySlot.item = item;
      emptySlot.quantity = amountToAdd;
      quantity -= amountToAdd;
      this.currentWeight += item.weight * amountToAdd;
      
      console.log(`[AdvancedInventorySystem] Added ${amountToAdd}x ${item.name}`);
    }
    
    if (this.onItemAdded) this.onItemAdded(item, quantity);
    return true;
  }
  
  /**
   * Remove item from inventory
   */
  removeItem(itemId: string, quantity: number = 1): boolean {
    let remaining = quantity;
    
    for (const slot of this.slots) {
      if (slot.item && slot.item.id === itemId && remaining > 0) {
        const amountToRemove = Math.min(remaining, slot.quantity);
        slot.quantity -= amountToRemove;
        remaining -= amountToRemove;
        this.currentWeight -= slot.item.weight * amountToRemove;
        
        if (slot.quantity === 0) {
          const removedItem = slot.item;
          slot.item = null;
          if (this.onItemRemoved) this.onItemRemoved(removedItem, amountToRemove);
        }
        
        console.log(`[AdvancedInventorySystem] Removed ${amountToRemove}x ${itemId}`);
      }
    }
    
    return remaining === 0;
  }
  
  /**
   * Equip item to slot
   */
  equipItem(itemId: string): boolean {
    const slot = this.slots.find(s => s.item && s.item.id === itemId);
    if (!slot || !slot.item || !slot.item.equipSlot) {
      console.warn('[AdvancedInventorySystem] Cannot equip item');
      return false;
    }
    
    const item = slot.item;
    const equipSlot = item.equipSlot;
    
    // Unequip current item in that slot
    if (this.equipped.has(equipSlot)) {
      this.unequipItem(equipSlot);
    }
    
    // Equip new item
    this.equipped.set(equipSlot, item);
    this.removeItem(itemId, 1);
    
    console.log(`[AdvancedInventorySystem] Equipped ${item.name} to ${equipSlot}`);
    
    if (this.onItemEquipped) this.onItemEquipped(item, equipSlot);
    return true;
  }
  
  /**
   * Unequip item from slot
   */
  unequipItem(equipSlot: EquipSlot): boolean {
    const item = this.equipped.get(equipSlot);
    if (!item) return false;
    
    // Add back to inventory
    if (!this.addItem(item, 1)) {
      console.warn('[AdvancedInventorySystem] Inventory full, cannot unequip');
      return false;
    }
    
    this.equipped.delete(equipSlot);
    console.log(`[AdvancedInventorySystem] Unequipped ${item.name} from ${equipSlot}`);
    return true;
  }
  
  /**
   * Get item count
   */
  getItemCount(itemId: string): number {
    return this.slots
      .filter(s => s.item && s.item.id === itemId)
      .reduce((sum, s) => sum + s.quantity, 0);
  }
  
  /**
   * Has item
   */
  hasItem(itemId: string, quantity: number = 1): boolean {
    return this.getItemCount(itemId) >= quantity;
  }
  
  /**
   * Sort inventory
   */
  sortInventory(sortBy: 'name' | 'type' | 'rarity' | 'value' = 'type'): void {
    const items: { item: Item; quantity: number }[] = [];
    
    // Collect all items
    this.slots.forEach(slot => {
      if (slot.item) {
        items.push({ item: slot.item, quantity: slot.quantity });
        slot.item = null;
        slot.quantity = 0;
      }
    });
    
    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.item.name.localeCompare(b.item.name);
        case 'type':
          return a.item.type.localeCompare(b.item.type);
        case 'rarity':
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity];
        case 'value':
          return b.item.value - a.item.value;
        default:
          return 0;
      }
    });
    
    // Put items back
    items.forEach(({ item, quantity }) => {
      this.addItem(item, quantity);
    });
    
    console.log(`[AdvancedInventorySystem] Sorted inventory by ${sortBy}`);
  }
  
  /**
   * Add gold
   */
  addGold(amount: number): void {
    this.gold += amount;
    console.log(`[AdvancedInventorySystem] Added ${amount} gold (total: ${this.gold})`);
  }
  
  /**
   * Remove gold
   */
  removeGold(amount: number): boolean {
    if (this.gold < amount) {
      console.warn('[AdvancedInventorySystem] Not enough gold');
      return false;
    }
    this.gold -= amount;
    console.log(`[AdvancedInventorySystem] Removed ${amount} gold (total: ${this.gold})`);
    return true;
  }
  
  /**
   * Get all items
   */
  getAllItems(): InventorySlot[] {
    return this.slots.filter(s => s.item !== null);
  }
  
  /**
   * Get equipped items
   */
  getEquippedItems(): Map<EquipSlot, Item> {
    return new Map(this.equipped);
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    usedSlots: number;
    totalSlots: number;
    currentWeight: number;
    maxWeight: number;
    gold: number;
    equippedItems: number;
  } {
    return {
      usedSlots: this.slots.filter(s => s.item !== null).length,
      totalSlots: this.maxSlots,
      currentWeight: this.currentWeight,
      maxWeight: this.maxWeight,
      gold: this.gold,
      equippedItems: this.equipped.size
    };
  }
  
  /**
   * Set callbacks
   */
  setCallbacks(callbacks: {
    onItemAdded?: (item: Item, quantity: number) => void;
    onItemRemoved?: (item: Item, quantity: number) => void;
    onItemEquipped?: (item: Item, slot: EquipSlot) => void;
  }): void {
    if (callbacks.onItemAdded) this.onItemAdded = callbacks.onItemAdded;
    if (callbacks.onItemRemoved) this.onItemRemoved = callbacks.onItemRemoved;
    if (callbacks.onItemEquipped) this.onItemEquipped = callbacks.onItemEquipped;
  }
}
