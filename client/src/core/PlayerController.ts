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

  constructor(camera: THREE.Camera, startPosition: THREE.Vector3) {
    this.camera = camera;
    this.position = startPosition.clone();
    this.velocity = new THREE.Vector3();
    
    this.setupEventListeners();
    this.setupPointerLock();
  }

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
