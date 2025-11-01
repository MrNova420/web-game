import { describe, it, expect, beforeEach } from 'vitest';
import { InventorySystem } from '../systems/InventorySystem';

describe('InventorySystem', () => {
  let inventory: InventorySystem;

  beforeEach(() => {
    inventory = new InventorySystem();
  });

  it('should create an inventory system', () => {
    expect(inventory).toBeDefined();
  });

  it('should add items to inventory', () => {
    const added = inventory.addItem({ id: 'sword', name: 'Iron Sword', quantity: 1 });
    expect(added).toBe(true);
  });

  it('should remove items from inventory', () => {
    inventory.addItem({ id: 'sword', name: 'Iron Sword', quantity: 1 });
    const removed = inventory.removeItem('sword', 1);
    expect(removed).toBe(true);
  });

  it('should check if item exists', () => {
    inventory.addItem({ id: 'potion', name: 'Health Potion', quantity: 5 });
    const hasItem = inventory.hasItem('potion');
    expect(hasItem).toBe(true);
  });

  it('should get item quantity', () => {
    inventory.addItem({ id: 'arrow', name: 'Arrow', quantity: 50 });
    const quantity = inventory.getItemQuantity('arrow');
    expect(quantity).toBe(50);
  });

  it('should handle inventory capacity', () => {
    const slots = inventory.getMaxSlots();
    expect(slots).toBeGreaterThan(0);
  });

  it('should stack items correctly', () => {
    inventory.addItem({ id: 'wood', name: 'Wood', quantity: 10 });
    inventory.addItem({ id: 'wood', name: 'Wood', quantity: 5 });
    const quantity = inventory.getItemQuantity('wood');
    expect(quantity).toBe(15);
  });
});
