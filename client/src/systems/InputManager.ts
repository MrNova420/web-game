/**
 * Key binding
 */
export interface KeyBinding {
  action: string;
  key: string;
  description: string;
}

/**
 * InputManager - Handles keyboard, mouse, and touch input
 * Centralizes input handling for the game with mobile support
 */
export class InputManager {
  private keys = new Map<string, boolean>();
  private mouseButtons = new Map<number, boolean>();
  private mousePosition = { x: 0, y: 0 };
  private mouseDelta = { x: 0, y: 0 };
  private lastMousePosition = { x: 0, y: 0 };
  private wheelDelta = 0;
  
  // Touch/Mobile support
  private touches = new Map<number, { x: number; y: number }>();
  private touchMovement = { x: 0, z: 0 }; // Virtual joystick movement
  private touchLook = { x: 0, y: 0 }; // Touch look/camera control
  private isMobileDevice = false;
  private touchJoystickActive = false;
  private touchJoystickStart = { x: 0, y: 0 };
  private touchCameraActive = false;
  private touchCameraLast = { x: 0, y: 0 };
  
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
    // Detect mobile device
    this.isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                          ('ontouchstart' in window) ||
                          (navigator.maxTouchPoints > 0);
    
    console.log(`InputManager initialized (Mobile: ${this.isMobileDevice})`);
    this.setupEventListeners(canvas);
  }

  /**
   * Setup event listeners for keyboard, mouse, and touch
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

    // Touch events for mobile
    target.addEventListener('touchstart', (e: TouchEvent) => {
      e.preventDefault();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        this.touches.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
        
        // Left half of screen = movement joystick
        if (touch.clientX < window.innerWidth / 2) {
          this.touchJoystickActive = true;
          this.touchJoystickStart = { x: touch.clientX, y: touch.clientY };
        }
        // Right half of screen = camera look
        else {
          this.touchCameraActive = true;
          this.touchCameraLast = { x: touch.clientX, y: touch.clientY };
        }
      }
    }, { passive: false });

    target.addEventListener('touchmove', (e: TouchEvent) => {
      e.preventDefault();
      
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        const touchPos = { x: touch.clientX, y: touch.clientY };
        this.touches.set(touch.identifier, touchPos);
        
        // Update movement joystick
        if (this.touchJoystickActive && touch.clientX < window.innerWidth / 2) {
          const dx = touchPos.x - this.touchJoystickStart.x;
          const dz = touchPos.y - this.touchJoystickStart.y;
          
          // Normalize to -1 to 1 range (with deadzone)
          const maxDistance = 100;
          const deadzone = 10;
          const distance = Math.sqrt(dx * dx + dz * dz);
          
          if (distance > deadzone) {
            const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
            this.touchMovement.x = (dx / distance) * normalizedDistance;
            this.touchMovement.z = (dz / distance) * normalizedDistance;
          } else {
            this.touchMovement.x = 0;
            this.touchMovement.z = 0;
          }
        }
        
        // Update camera look
        if (this.touchCameraActive && touch.clientX >= window.innerWidth / 2) {
          this.touchLook.x = touchPos.x - this.touchCameraLast.x;
          this.touchLook.y = touchPos.y - this.touchCameraLast.y;
          this.touchCameraLast = touchPos;
        }
      }
    }, { passive: false });

    target.addEventListener('touchend', (e: TouchEvent) => {
      e.preventDefault();
      
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.touches.delete(touch.identifier);
      }
      
      // Reset touch controls if no touches remain
      if (this.touches.size === 0) {
        this.touchJoystickActive = false;
        this.touchCameraActive = false;
        this.touchMovement = { x: 0, z: 0 };
        this.touchLook = { x: 0, y: 0 };
      }
    }, { passive: false });

    target.addEventListener('touchcancel', (e: TouchEvent) => {
      // Same as touchend
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        this.touches.delete(touch.identifier);
      }
      
      if (this.touches.size === 0) {
        this.touchJoystickActive = false;
        this.touchCameraActive = false;
        this.touchMovement = { x: 0, z: 0 };
        this.touchLook = { x: 0, y: 0 };
      }
    }, { passive: false });

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
   * For mobile, returns touch camera look delta
   */
  getMouseDelta(): { x: number; y: number } {
    // If mobile and touch look is active, return touch delta
    if (this.isMobileDevice && this.touchCameraActive) {
      const delta = { ...this.touchLook };
      this.touchLook.x = 0;
      this.touchLook.y = 0;
      return delta;
    }
    
    // Otherwise return mouse delta
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
   * Combines keyboard and touch joystick input
   */
  getMovementInput(): { x: number; z: number } {
    let x = 0;
    let z = 0;

    // Keyboard input
    if (this.isActionPressed('move_forward')) z -= 1;
    if (this.isActionPressed('move_backward')) z += 1;
    if (this.isActionPressed('move_left')) x -= 1;
    if (this.isActionPressed('move_right')) x += 1;

    // Touch joystick input (overrides keyboard if active)
    if (this.isMobileDevice && this.touchJoystickActive) {
      x = this.touchMovement.x;
      z = this.touchMovement.z;
    }

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
   * Includes touch joystick for mobile
   */
  isMoving(): boolean {
    return this.isActionPressed('move_forward') ||
           this.isActionPressed('move_backward') ||
           this.isActionPressed('move_left') ||
           this.isActionPressed('move_right') ||
           (this.isMobileDevice && this.touchJoystickActive);
  }

  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return this.isMobileDevice;
  }

  /**
   * Get touch count
   */
  getTouchCount(): number {
    return this.touches.size;
  }
}
