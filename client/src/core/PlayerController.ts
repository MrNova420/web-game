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
    // Create joystick container
    const joystickContainer = document.createElement('div');
    joystickContainer.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 80px;
      width: 120px;
      height: 120px;
      background: rgba(255, 255, 255, 0.3);
      border: 3px solid rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      z-index: 1000;
      touch-action: none;
    `;
    
    // Create joystick stick
    this.joystickElement = document.createElement('div');
    this.joystickElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transition: all 0.1s;
    `;
    
    joystickContainer.appendChild(this.joystickElement);
    document.body.appendChild(joystickContainer);
    
    // Joystick touch handlers
    joystickContainer.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.moveTouchId = touch.identifier;
      this.handleJoystickMove(touch, joystickContainer);
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
    
    joystickContainer.addEventListener('touchend', (e) => {
      this.moveTouchId = null;
      this.moveForward = false;
      this.moveBackward = false;
      this.moveLeft = false;
      this.moveRight = false;
      if (this.joystickElement) {
        this.joystickElement.style.transform = 'translate(-50%, -50%)';
      }
    }, { passive: false });
  }
  
  private handleJoystickMove(touch: Touch, container: HTMLElement) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = touch.clientX - centerX;
    const deltaY = touch.clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
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
