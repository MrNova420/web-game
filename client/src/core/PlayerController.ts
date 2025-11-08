import * as THREE from 'three';

export class PlayerController {
  private camera: THREE.Camera;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private moveSpeed: number = 20;
  private moveForward: boolean = false;
  private moveBackward: boolean = false;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private canJump: boolean = false;
  private isJumping: boolean = false;
  private yaw: number = 0;
  private pitch: number = 0;
  private mouseSensitivity: number = 0.002;
  
  // MOBILE TOUCH CONTROLS (per AUTONOMOUS_DEVELOPMENT_GUIDE.md)
  private isMobile: boolean = false;
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private touchMoveActive: boolean = false;
  private joystickElement: HTMLDivElement | null = null;
  private lookTouchId: number | null = null;
  private moveTouchId: number | null = null;

  constructor(camera: THREE.Camera, startPosition: THREE.Vector3) {
    this.camera = camera;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3();
    
    // Detect mobile device
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || window.innerWidth < 768;
    
    this.setupEventListeners();
    
    if (this.isMobile) {
      this.setupMobileTouchControls();
    } else {
      this.setupPointerLock();
    }
  }
  
  /**
   * MOBILE TOUCH CONTROLS - Virtual joystick for movement + touch drag for look
   */
  private setupMobileTouchControls() {
    console.log('[PlayerController] Setting up mobile touch controls');
    
    // Create virtual joystick for movement (left side of screen)
    this.createVirtualJoystick();
    
    // Right side of screen for camera look
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
      canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
      canvas.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: false });
    }
  }
  
  private createVirtualJoystick() {
    // Create joystick container - matching menu theme
    const joystickContainer = document.createElement('div');
    joystickContainer.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 100px;
      width: 140px;
      height: 140px;
      background: radial-gradient(circle, rgba(45, 74, 110, 0.6), rgba(26, 43, 74, 0.8));
      border: 3px solid rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      z-index: 1000;
      touch-action: none;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.2);
    `;
    
    // Create outer ring indicator
    const outerRing = document.createElement('div');
    outerRing.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      height: 90%;
      border: 2px dashed rgba(0, 255, 255, 0.3);
      border-radius: 50%;
      pointer-events: none;
    `;
    joystickContainer.appendChild(outerRing);
    
    // Create joystick stick - themed
    this.joystickElement = document.createElement('div');
    this.joystickElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, rgba(0, 255, 255, 0.9), rgba(0, 200, 255, 0.95));
      border: 3px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transition: all 0.1s;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.3);
      pointer-events: none;
    `;
    
    // Add direction indicator
    const directionIndicator = document.createElement('div');
    directionIndicator.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: rgba(0, 0, 0, 0.7);
      font-weight: bold;
      font-size: 20px;
      pointer-events: none;
    `;
    directionIndicator.textContent = '⊕';
    this.joystickElement.appendChild(directionIndicator);
    
    joystickContainer.appendChild(this.joystickElement);
    document.body.appendChild(joystickContainer);
    
    // Add label
    const label = document.createElement('div');
    label.style.cssText = `
      position: fixed;
      bottom: 60px;
      left: 50%;
      transform: translateX(-50%);
      color: rgba(0, 255, 255, 0.8);
      font-weight: bold;
      font-size: 12px;
      text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      pointer-events: none;
      z-index: 999;
      font-family: Arial, sans-serif;
      letter-spacing: 1px;
    `;
    label.textContent = 'MOVE';
    joystickContainer.appendChild(label);
    
    // Joystick touch handlers
    joystickContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.moveTouchId = touch.identifier;
      this.handleJoystickMove(touch, joystickContainer);
      joystickContainer.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.8), inset 0 0 30px rgba(0, 255, 255, 0.4)';
    }, { passive: false });
    
    joystickContainer.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === this.moveTouchId) {
          this.handleJoystickMove(e.touches[i], joystickContainer);
          break;
        }
      }
    }, { passive: false });
    
    joystickContainer.addEventListener('touchend', (_e) => {
      this.moveTouchId = null;
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      if (this.joystickElement) {
        this.joystickElement.style.transform = 'translate(-50%, -50%)';
      }
      joystickContainer.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.2)';
    }, { passive: false });
    
    // Add action buttons (jump, interact)
    this.createActionButtons();
  }
  
  /**
   * Create action buttons for mobile (jump, interact, etc.)
   */
  private createActionButtons() {
    // Jump button
    const jumpButton = document.createElement('button');
    jumpButton.style.cssText = `
      position: fixed;
      bottom: 180px;
      right: 100px;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, rgba(45, 74, 110, 0.9), rgba(26, 43, 74, 0.95));
      border: 3px solid rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      color: rgba(0, 255, 255, 0.9);
      font-size: 32px;
      font-weight: bold;
      z-index: 1000;
      touch-action: none;
      box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
      cursor: pointer;
      transition: all 0.2s;
    `;
    jumpButton.textContent = '⬆';
    jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.isJumping = true;
      jumpButton.style.transform = 'scale(0.9)';
      jumpButton.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.8)';
    });
    jumpButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.isJumping = false;
      jumpButton.style.transform = 'scale(1)';
      jumpButton.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.4)';
    });
    document.body.appendChild(jumpButton);

    // Interact button
    const interactButton = document.createElement('button');
    interactButton.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 100px;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, rgba(45, 74, 110, 0.9), rgba(26, 43, 74, 0.95));
      border: 3px solid rgba(255, 215, 0, 0.6);
      border-radius: 50%;
      color: rgba(255, 215, 0, 0.9);
      font-size: 28px;
      font-weight: bold;
      z-index: 1000;
      touch-action: none;
      box-shadow: 0 0 20px rgba(255, 215, 0, 0.4);
      cursor: pointer;
      transition: all 0.2s;
    `;
    interactButton.textContent = '🤝';
    interactButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      interactButton.style.transform = 'scale(0.9)';
      interactButton.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
      console.log('[Mobile] Interact action');
    });
    interactButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      interactButton.style.transform = 'scale(1)';
      interactButton.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.4)';
    });
    document.body.appendChild(interactButton);

    // Attack button
    const attackButton = document.createElement('button');
    attackButton.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 200px;
      width: 70px;
      height: 70px;
      background: linear-gradient(135deg, rgba(255, 0, 0, 0.7), rgba(200, 0, 0, 0.85));
      border: 3px solid rgba(255, 100, 100, 0.6);
      border-radius: 50%;
      color: white;
      font-size: 28px;
      font-weight: bold;
      z-index: 1000;
      touch-action: none;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.4);
      cursor: pointer;
      transition: all 0.2s;
    `;
    attackButton.textContent = '⚔️';
    attackButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      attackButton.style.transform = 'scale(0.9)';
      attackButton.style.boxShadow = '0 0 30px rgba(255, 0, 0, 0.8)';
      console.log('[Mobile] Attack action');
    });
    attackButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      attackButton.style.transform = 'scale(1)';
      attackButton.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.4)';
    });
    document.body.appendChild(attackButton);
  }
  
  private handleJoystickMove(touch: Touch, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    // Calculate distance for clamping
    // const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 35; // Max joystick displacement
    
    // Clamp to max distance
    const clampedX = Math.max(-maxDistance, Math.min(maxDistance, deltaX));
    const clampedY = Math.max(-maxDistance, Math.min(maxDistance, deltaY));
    
    // Move joystick stick
    if (this.joystickElement) {
      this.joystickElement.style.transform = `translate(calc(-50% + ${clampedX}px), calc(-50% + ${clampedY}px))`;
    }
    
    // Set movement directions based on joystick position
    const threshold = 10;
    this.moveForward = clampedY < -threshold;
    this.moveBackward = clampedY > threshold;
    this.moveLeft = clampedX < -threshold;
    this.moveRight = clampedX > threshold;
  }
  
  private onTouchStart(event: TouchEvent) {
    event.preventDefault();
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      
      // Right side of screen for camera look
      if (touch.clientX > window.innerWidth / 2 && this.lookTouchId === null) {
        this.lookTouchId = touch.identifier;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchMoveActive = true;
      }
    }
  }
  
  private onTouchMove(event: TouchEvent) {
    event.preventDefault();
    
    if (!this.touchMoveActive) return;
    
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      
      if (touch.identifier === this.lookTouchId) {
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;
        
        // Update camera rotation
        this.yaw -= deltaX * 0.005;
        this.pitch -= deltaY * 0.005;
        
        // Clamp pitch
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
      }
    }
  }
  
  private onTouchEnd(event: TouchEvent) {
    // Check if our look touch ended
    let lookTouchEnded = true;
    for (let i = 0; i < event.touches.length; i++) {
      if (event.touches[i].identifier === this.lookTouchId) {
        lookTouchEnded = false;
        break;
      }
    }
    
    if (lookTouchEnded) {
      this.lookTouchId = null;
      this.touchMoveActive = false;
    }
  }

  
  /**
   * DESKTOP KEYBOARD/MOUSE CONTROLS
   */
  private setupEventListeners() {
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    document.addEventListener('mousemove', (event) => this.onMouseMove(event));
  }

  private setupPointerLock() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', () => {
        canvas.requestPointerLock();
      });
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = true;
        break;
      case 'Space':
        if (this.canJump) {
          this.velocity.y += 10;
          this.isJumping = true;
          this.canJump = false;
        }
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.moveForward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.moveBackward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.moveLeft = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.moveRight = false;
        break;
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement) {
      this.yaw -= event.movementX * this.mouseSensitivity;
      this.pitch -= event.movementY * this.mouseSensitivity;
      
      // Clamp pitch to prevent camera flipping
      this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
    }
  }

  update(deltaTime: number, terrainHeight: number) {
    // Apply gravity
    this.velocity.y -= 9.8 * deltaTime * 2;

    // Movement direction based on camera orientation
    const direction = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);

    // Rotate direction vectors based on yaw
    forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
    right.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    if (this.moveForward) direction.add(forward);
    if (this.moveBackward) direction.sub(forward);
    if (this.moveLeft) direction.sub(right);
    if (this.moveRight) direction.add(right);

    direction.normalize();

    // Apply movement
    this.velocity.x = direction.x * this.moveSpeed;
    this.velocity.z = direction.z * this.moveSpeed;

    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    // Simple terrain collision
    const groundLevel = terrainHeight + 2; // 2 units above terrain
    if (this.position.y < groundLevel) {
      this.position.y = groundLevel;
      this.velocity.y = 0;
      this.canJump = true;
      this.isJumping = false;
    }

    // Update camera position and rotation
    this.camera.position.copy(this.position);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');

    // Dampen horizontal velocity
    this.velocity.x *= 0.9;
    this.velocity.z *= 0.9;
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  setPosition(position: THREE.Vector3) {
    this.position.copy(position);
  }
}
