/**
 * Key binding
 */
export interface KeyBinding {
  action: string;
  key: string;
  description: string;
}

/**
 * InputManager - Handles keyboard and mouse input
 * Centralizes input handling for the game
 */
export class InputManager {
  private keys = new Map<string, boolean>();
  private mouseButtons = new Map<number, boolean>();
  private mousePosition = { x: 0, y: 0 };
  private mouseDelta = { x: 0, y: 0 };
  private lastMousePosition = { x: 0, y: 0 };
  private wheelDelta = 0;
  
  private keyBindings: KeyBinding[] = [
    { action: 'move_forward', key: 'w', description: 'Move Forward' },
    { action: 'move_backward', key: 's', description: 'Move Backward' },
    { action: 'move_left', key: 'a', description: 'Move Left' },
    { action: 'move_right', key: 'd', description: 'Move Right' },
    { action: 'jump', key: ' ', description: 'Jump' },
    { action: 'interact', key: 'e', description: 'Interact' },
    { action: 'inventory', key: 'i', description: 'Open Inventory' },
    { action: 'character', key: 'c', description: 'Open Character' },
    { action: 'quests', key: 'q', description: 'Open Quests' },
    { action: 'map', key: 'm', description: 'Toggle Map' },
    { action: 'attack', key: '1', description: 'Attack' },
    { action: 'spell', key: '2', description: 'Cast Spell' },
    { action: 'escape', key: 'Escape', description: 'Menu/Cancel' }
  ];

  constructor(canvas?: HTMLCanvasElement) {
    this.setupEventListeners(canvas);
    console.log('InputManager initialized');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(canvas?: HTMLCanvasElement) {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.key.toLowerCase(), true);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.key.toLowerCase(), false);
    });

    // Mouse events
    const target = canvas || window;
    
    target.addEventListener('mousedown', (e: any) => {
      this.mouseButtons.set(e.button, true);
    });

    target.addEventListener('mouseup', (e: any) => {
      this.mouseButtons.set(e.button, false);
    });

    target.addEventListener('mousemove', (e: any) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      
      this.mouseDelta.x = e.clientX - this.lastMousePosition.x;
      this.mouseDelta.y = e.clientY - this.lastMousePosition.y;
      
      this.lastMousePosition.x = e.clientX;
      this.lastMousePosition.y = e.clientY;
    });

    target.addEventListener('wheel', (e: any) => {
      this.wheelDelta = e.deltaY;
    });

    // Prevent context menu
    if (canvas) {
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });
    }
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  /**
   * Check if action is pressed
   */
  isActionPressed(action: string): boolean {
    const binding = this.keyBindings.find(b => b.action === action);
    if (binding) {
      return this.isKeyPressed(binding.key);
    }
    return false;
  }

  /**
   * Check if mouse button is pressed
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Get mouse position
   */
  getMousePosition(): { x: number; y: number } {
    return { ...this.mousePosition };
  }

  /**
   * Get mouse delta (movement since last frame)
   */
  getMouseDelta(): { x: number; y: number } {
    const delta = { ...this.mouseDelta };
    // Reset delta after reading
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  /**
   * Get wheel delta
   */
  getWheelDelta(): number {
    const delta = this.wheelDelta;
    this.wheelDelta = 0;
    return delta;
  }

  /**
   * Get key bindings
   */
  getKeyBindings(): KeyBinding[] {
    return [...this.keyBindings];
  }

  /**
   * Set key binding
   */
  setKeyBinding(action: string, key: string) {
    const binding = this.keyBindings.find(b => b.action === action);
    if (binding) {
      binding.key = key;
    }
  }

  /**
   * Update (called each frame)
   */
  update() {
    // Clear one-frame inputs if needed
  }

  /**
   * Clear all input states
   */
  clear() {
    this.keys.clear();
    this.mouseButtons.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    this.wheelDelta = 0;
  }

  /**
   * Get movement input vector
   */
  getMovementInput(): { x: number; z: number } {
    let x = 0;
    let z = 0;

    if (this.isActionPressed('move_forward')) z -= 1;
    if (this.isActionPressed('move_backward')) z += 1;
    if (this.isActionPressed('move_left')) x -= 1;
    if (this.isActionPressed('move_right')) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && z !== 0) {
      const length = Math.sqrt(x * x + z * z);
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  /**
   * Check if any movement key is pressed
   */
  isMoving(): boolean {
    return this.isActionPressed('move_forward') ||
           this.isActionPressed('move_backward') ||
           this.isActionPressed('move_left') ||
           this.isActionPressed('move_right');
  }
}
