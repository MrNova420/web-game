/**
 * UniversalInputManager - Multi-device input system
 * ENHANCEMENT: Support keyboard, mouse, touch, gamepad with context-aware input
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD System 1.2
 */

export type InputMode = 'keyboard' | 'touch' | 'gamepad';
export type InputContext = 'gameplay' | 'menu' | 'crafting' | 'dialogue' | 'inventory' | 'building';

export interface InputAction {
  pressed: boolean;
  justPressed: boolean;
  justReleased: boolean;
  value: number; // 0-1 for analog inputs
}

export interface InputState {
  // Movement
  moveX: number;
  moveZ: number;
  moveSpeed: number;

  // Actions
  jump: boolean;
  sprint: boolean;
  crouch: boolean;
  interact: boolean;

  // Combat
  attack: boolean;
  block: boolean;
  dodge: boolean;

  // UI
  inventory: boolean;
  map: boolean;
  menu: boolean;
  craft: boolean;

  // Camera
  cameraDeltaX: number;
  cameraDeltaY: number;
}

interface GamepadState {
  connected: boolean;
  index: number;
  axes: number[];
  buttons: boolean[];
}

/**
 * UniversalInputManager handles all input types
 */
export class UniversalInputManager {
  private activeInputMode: InputMode = 'keyboard';
  private currentContext: InputContext = 'gameplay';

  // Input state
  private keys = new Map<string, boolean>();
  private mouseButtons = new Map<number, boolean>();
  private mouseDelta = { x: 0, y: 0 };
  private mousePosition = { x: 0, y: 0 };
  private touchActive = false;
  private gamepadStates: GamepadState[] = [];

  // Context-specific bindings
  private keyBindings = new Map<string, string>();
  private customBindings = new Map<string, string>();

  // Callbacks
  private onInputModeChange: ((mode: InputMode) => void) | null = null;
  private onContextChange: ((context: InputContext) => void) | null = null;

  // Mouse sensitivity
  private mouseSensitivity = 1.0;
  private touchSensitivity = 1.0;

  // Pointer lock
  private pointerLocked = false;

  constructor() {
    this.setupDefaultBindings();
    this.setupEventListeners();
    console.log('[UniversalInputManager] Initialized');
  }

  /**
   * Setup default key bindings
   */
  private setupDefaultBindings(): void {
    // Movement
    this.keyBindings.set('w', 'moveForward');
    this.keyBindings.set('s', 'moveBackward');
    this.keyBindings.set('a', 'moveLeft');
    this.keyBindings.set('d', 'moveRight');
    this.keyBindings.set(' ', 'jump');
    this.keyBindings.set('shift', 'sprint');
    this.keyBindings.set('control', 'crouch');

    // Actions
    this.keyBindings.set('e', 'interact');
    this.keyBindings.set('r', 'reload');
    this.keyBindings.set('f', 'use');

    // Combat
    this.keyBindings.set('mouse0', 'attack');
    this.keyBindings.set('mouse1', 'block');
    this.keyBindings.set('q', 'dodge');

    // UI
    this.keyBindings.set('i', 'inventory');
    this.keyBindings.set('m', 'map');
    this.keyBindings.set('escape', 'menu');
    this.keyBindings.set('c', 'craft');
    this.keyBindings.set('b', 'building');
  }

  /**
   * Setup event listeners for all input types
   */
  private setupEventListeners(): void {
    // Keyboard
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    // Mouse
    window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('wheel', (e) => this.handleMouseWheel(e));

    // Touch
    window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

    // Gamepad
    window.addEventListener('gamepadconnected', (e) => this.handleGamepadConnected(e));
    window.addEventListener('gamepaddisconnected', (e) => this.handleGamepadDisconnected(e));

    // Pointer lock
    document.addEventListener('pointerlockchange', () => this.handlePointerLockChange());
  }

  /**
   * Keyboard event handlers
   */
  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.keys.set(key, true);
    this.setInputMode('keyboard');
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.keys.set(key, false);
  }

  /**
   * Mouse event handlers
   */
  private handleMouseDown(e: MouseEvent): void {
    this.mouseButtons.set(e.button, true);
    this.setInputMode('keyboard'); // Mouse counts as keyboard mode
  }

  private handleMouseUp(e: MouseEvent): void {
    this.mouseButtons.set(e.button, false);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (this.pointerLocked) {
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    }
    this.mousePosition.x = e.clientX;
    this.mousePosition.y = e.clientY;
    this.setInputMode('keyboard');
  }

  private handleMouseWheel(e: WheelEvent): void {
    // Handle zoom or other wheel actions
  }

  /**
   * Touch event handlers
   */
  private handleTouchStart(e: TouchEvent): void {
    this.touchActive = true;
    this.setInputMode('touch');
    e.preventDefault();
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      // Handle touch movement
    }
    e.preventDefault();
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.touches.length === 0) {
      this.touchActive = false;
    }
    e.preventDefault();
  }

  /**
   * Gamepad event handlers
   */
  private handleGamepadConnected(e: GamepadEvent): void {
    console.log('[Input] Gamepad connected:', e.gamepad.id);
    this.setInputMode('gamepad');
  }

  private handleGamepadDisconnected(e: GamepadEvent): void {
    console.log('[Input] Gamepad disconnected:', e.gamepad.id);
  }

  /**
   * Pointer lock handlers
   */
  private handlePointerLockChange(): void {
    this.pointerLocked = document.pointerLockElement !== null;
    console.log('[Input] Pointer lock:', this.pointerLocked);
  }

  /**
   * Request pointer lock for FPS controls
   */
  requestPointerLock(): void {
    document.body.requestPointerLock();
  }

  /**
   * Exit pointer lock
   */
  exitPointerLock(): void {
    document.exitPointerLock();
  }

  /**
   * Update input state (call every frame)
   */
  update(): void {
    // Update gamepad state
    this.updateGamepads();
  }

  /**
   * Update gamepad state
   */
  private updateGamepads(): void {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        // Store gamepad state
        this.gamepadStates[i] = {
          connected: true,
          index: i,
          axes: Array.from(gamepad.axes),
          buttons: gamepad.buttons.map((b) => b.pressed),
        };
      }
    }
  }

  /**
   * Get current input state
   */
  getInputState(): InputState {
    const state: InputState = {
      moveX: 0,
      moveZ: 0,
      moveSpeed: 1.0,
      jump: false,
      sprint: false,
      crouch: false,
      interact: false,
      attack: false,
      block: false,
      dodge: false,
      inventory: false,
      map: false,
      menu: false,
      craft: false,
      cameraDeltaX: this.mouseDelta.x * this.mouseSensitivity,
      cameraDeltaY: this.mouseDelta.y * this.mouseSensitivity,
    };

    // Reset mouse delta after reading
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;

    // Calculate movement based on input mode
    if (this.activeInputMode === 'keyboard') {
      // WASD movement
      if (this.keys.get('w')) state.moveZ += 1;
      if (this.keys.get('s')) state.moveZ -= 1;
      if (this.keys.get('a')) state.moveX -= 1;
      if (this.keys.get('d')) state.moveX += 1;

      // Actions
      state.jump = this.keys.get(' ') || false;
      state.sprint = this.keys.get('shift') || false;
      state.crouch = this.keys.get('control') || false;
      state.interact = this.keys.get('e') || false;

      // Combat
      state.attack = this.mouseButtons.get(0) || false;
      state.block = this.mouseButtons.get(2) || false;
      state.dodge = this.keys.get('q') || false;

      // UI
      state.inventory = this.keys.get('i') || false;
      state.map = this.keys.get('m') || false;
      state.menu = this.keys.get('escape') || false;
      state.craft = this.keys.get('c') || false;
    } else if (this.activeInputMode === 'gamepad') {
      // Use gamepad input
      if (this.gamepadStates[0]) {
        const gp = this.gamepadStates[0];
        state.moveX = gp.axes[0] || 0;
        state.moveZ = -(gp.axes[1] || 0); // Invert Y axis
        state.cameraDeltaX = (gp.axes[2] || 0) * 5;
        state.cameraDeltaY = (gp.axes[3] || 0) * 5;

        state.jump = gp.buttons[0] || false; // A button
        state.sprint = gp.buttons[1] || false; // B button
        state.interact = gp.buttons[2] || false; // X button
        state.attack = gp.buttons[7] || false; // Right trigger
      }
    }

    // Normalize movement vector
    const moveLength = Math.sqrt(state.moveX * state.moveX + state.moveZ * state.moveZ);
    if (moveLength > 0) {
      state.moveX /= moveLength;
      state.moveZ /= moveLength;
    }

    return state;
  }

  /**
   * Set active input mode
   */
  private setInputMode(mode: InputMode): void {
    if (this.activeInputMode !== mode) {
      this.activeInputMode = mode;
      console.log('[Input] Mode changed to:', mode);
      if (this.onInputModeChange) {
        this.onInputModeChange(mode);
      }
    }
  }

  /**
   * Set input context
   */
  setContext(context: InputContext): void {
    if (this.currentContext !== context) {
      this.currentContext = context;
      console.log('[Input] Context changed to:', context);
      if (this.onContextChange) {
        this.onContextChange(context);
      }
    }
  }

  /**
   * Get current input mode
   */
  getInputMode(): InputMode {
    return this.activeInputMode;
  }

  /**
   * Get current context
   */
  getContext(): InputContext {
    return this.currentContext;
  }

  /**
   * Set mouse sensitivity
   */
  setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
  }

  /**
   * Set callbacks
   */
  setOnInputModeChange(callback: (mode: InputMode) => void): void {
    this.onInputModeChange = callback;
  }

  setOnContextChange(callback: (context: InputContext) => void): void {
    this.onContextChange = callback;
  }

  /**
   * Check if key is pressed
   */
  isKeyPressed(key: string): boolean {
    return this.keys.get(key.toLowerCase()) || false;
  }

  /**
   * Check if mouse button is pressed
   */
  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Remove all event listeners would go here
    console.log('[UniversalInputManager] Disposed');
  }
}
