/**
 * Professional Camera System
 * Section 5.2 from AUTONOMOUS_DEVELOPMENT_GUIDE2.MD
 * 
 * Multiple camera modes with:
 * - First-person, third-person, orbit, cinematic modes
 * - Smooth camera movement and transitions
 * - Collision avoidance
 * - Camera shake system
 * - Dynamic FOV
 */

import * as THREE from 'three';

export interface CameraInput {
  deltaX: number;
  deltaY: number;
}

export type CameraMode = 'firstPerson' | 'thirdPerson' | 'orbit' | 'cinematic';

interface CameraModeConfig {
  offset: THREE.Vector3;
  distance: number;
  fov: number;
  minPitch: number;
  maxPitch: number;
  heightAbove?: number;
  rotationSpeed?: number;
  smoothing?: number;
}

export class ProfessionalCameraSystem {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Object3D;
  private world: any;
  public currentMode: CameraMode = 'thirdPerson';
  
  // Camera mode configurations
  private modes: Record<CameraMode, CameraModeConfig> = {
    firstPerson: {
      offset: new THREE.Vector3(0, 1.7, 0),
      distance: 0,
      fov: 75,
      minPitch: -80,
      maxPitch: 80
    },
    thirdPerson: {
      offset: new THREE.Vector3(0, 2, 0),
      distance: 8,
      fov: 60,
      minPitch: -45,
      maxPitch: 60,
      heightAbove: 2
    },
    orbit: {
      offset: new THREE.Vector3(0, 0, 0),
      distance: 15,
      fov: 50,
      minPitch: -80,
      maxPitch: 80,
      rotationSpeed: 1.0
    },
    cinematic: {
      fov: 40,
      smoothing: 0.98,
      offset: new THREE.Vector3(0, 2, 0),
      distance: 12,
      minPitch: -60,
      maxPitch: 60
    }
  };
  
  // Smooth camera movement
  public currentYaw = 0;
  public currentPitch = 0;
  private currentDistance = 8;
  private desiredPosition = new THREE.Vector3();
  private smoothing = 0.1;
  
  // Camera shake
  private shakeIntensity = 0;
  private shakeDecay = 0.95;
  
  // Collision avoidance
  private raycaster = new THREE.Raycaster();
  
  constructor(camera: THREE.PerspectiveCamera, target: THREE.Object3D, world?: any) {
    this.camera = camera;
    this.target = target;
    this.world = world;
    this.currentDistance = this.modes[this.currentMode].distance;
  }
  
  update(deltaTime: number, input: CameraInput): void {
    this.updateRotation(input);
    this.calculateDesiredPosition();
    this.handleCameraCollision();
    this.applyCameraShake();
    this.smoothCameraMovement(deltaTime);
    this.updateFOV(deltaTime);
  }
  
  private updateRotation(input: CameraInput): void {
    const mode = this.modes[this.currentMode];
    
    // Update yaw (horizontal rotation)
    this.currentYaw += input.deltaX * 0.002;
    
    // Update pitch (vertical rotation)
    this.currentPitch += input.deltaY * 0.002;
    
    // Clamp pitch to prevent camera flipping
    const minPitchRad = (mode.minPitch * Math.PI) / 180;
    const maxPitchRad = (mode.maxPitch * Math.PI) / 180;
    this.currentPitch = Math.max(minPitchRad, Math.min(maxPitchRad, this.currentPitch));
  }
  
  private calculateDesiredPosition(): void {
    const mode = this.modes[this.currentMode];
    
    // Calculate camera offset based on yaw, pitch, and distance
    const offset = new THREE.Vector3(
      Math.sin(this.currentYaw) * Math.cos(this.currentPitch),
      Math.sin(this.currentPitch),
      Math.cos(this.currentYaw) * Math.cos(this.currentPitch)
    ).multiplyScalar(mode.distance);
    
    // Start from target position
    this.desiredPosition.copy(this.target.position);
    
    // Add mode-specific offset
    this.desiredPosition.add(mode.offset);
    
    // Add camera distance offset
    this.desiredPosition.add(offset);
  }
  
  private handleCameraCollision(): void {
    if (!this.world || !this.world.objects) return;
    
    const mode = this.modes[this.currentMode];
    
    // Calculate direction from target to desired camera position
    const targetPos = this.target.position.clone().add(mode.offset);
    const direction = this.desiredPosition.clone().sub(targetPos);
    const maxDistance = direction.length();
    direction.normalize();
    
    // Cast ray from target to camera
    this.raycaster.set(targetPos, direction);
    const hits = this.raycaster.intersectObjects(this.world.objects);
    
    if (hits.length > 0 && hits[0].distance < maxDistance) {
      // Pull camera closer to avoid collision
      const safeDistance = Math.max(0.5, hits[0].distance - 0.5);
      this.desiredPosition.copy(targetPos);
      this.desiredPosition.add(direction.multiplyScalar(safeDistance));
    }
  }
  
  private applyCameraShake(): void {
    if (this.shakeIntensity > 0.01) {
      const shake = new THREE.Vector3(
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity,
        (Math.random() - 0.5) * this.shakeIntensity
      );
      this.camera.position.add(shake);
      this.shakeIntensity *= this.shakeDecay;
    }
  }
  
  private smoothCameraMovement(deltaTime: number): void {
    const mode = this.modes[this.currentMode];
    const smoothFactor = mode.smoothing || this.smoothing;
    
    // Smooth interpolation to desired position
    this.camera.position.lerp(this.desiredPosition, smoothFactor);
    
    // Look at target
    const lookAtPos = this.target.position.clone();
    if (mode.heightAbove) {
      lookAtPos.y += mode.heightAbove;
    } else {
      lookAtPos.add(mode.offset);
    }
    this.camera.lookAt(lookAtPos);
  }
  
  private updateFOV(deltaTime: number): void {
    const mode = this.modes[this.currentMode];
    let targetFOV = mode.fov;
    
    // Increase FOV when target is moving fast (if target has velocity)
    const target = this.target as any;
    if (target.getVelocity) {
      const velocity = target.getVelocity();
      const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
      if (speed > 10) {
        targetFOV += Math.min(10, (speed - 10) * 0.5);
      }
    }
    
    // Smoothly interpolate FOV
    this.camera.fov += (targetFOV - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();
  }
  
  // Public methods
  public shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }
  
  public setMode(mode: CameraMode): void {
    this.currentMode = mode;
    const config = this.modes[mode];
    this.currentDistance = config.distance;
    this.camera.fov = config.fov;
    this.camera.updateProjectionMatrix();
  }
  
  public setTarget(target: THREE.Object3D): void {
    this.target = target;
  }
  
  public setWorld(world: any): void {
    this.world = world;
  }
  
  public getMode(): CameraMode {
    return this.currentMode;
  }
  
  public getStatistics() {
    return {
      mode: this.currentMode,
      yaw: (this.currentYaw * 180 / Math.PI).toFixed(1) + '°',
      pitch: (this.currentPitch * 180 / Math.PI).toFixed(1) + '°',
      fov: this.camera.fov.toFixed(1) + '°',
      distance: this.currentDistance.toFixed(2),
      shakeIntensity: this.shakeIntensity.toFixed(3),
      position: {
        x: this.camera.position.x.toFixed(2),
        y: this.camera.position.y.toFixed(2),
        z: this.camera.position.z.toFixed(2)
      }
    };
  }
}
