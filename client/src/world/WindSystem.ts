import * as THREE from 'three';

/**
 * WindSystem manages wind effects for vegetation and grass
 * Provides wind direction, strength, and time-based variations
 */
export class WindSystem {
  private windDirection: THREE.Vector3;
  private windStrength: number;
  private windTime: number;
  private baseWindSpeed: number;

  constructor() {
    this.windDirection = new THREE.Vector3(1, 0, 0.5).normalize();
    this.windStrength = 0.5; // 0 to 1
    this.windTime = 0;
    this.baseWindSpeed = 1.0;
  }

  /**
   * Update wind simulation
   */
  update(deltaTime: number) {
    this.windTime += deltaTime * this.baseWindSpeed;
    
    // Vary wind strength over time using sine wave
    const variation = Math.sin(this.windTime * 0.5) * 0.3;
    this.windStrength = 0.5 + variation;
    
    // Slowly rotate wind direction
    const rotationSpeed = 0.1;
    const angle = this.windTime * rotationSpeed;
    this.windDirection.set(
      Math.cos(angle),
      0,
      Math.sin(angle)
    ).normalize();
  }

  /**
   * Get current wind direction
   */
  getWindDirection(): THREE.Vector3 {
    return this.windDirection.clone();
  }

  /**
   * Get current wind strength (0-1)
   */
  getWindStrength(): number {
    return this.windStrength;
  }

  /**
   * Get wind time for shader use
   */
  getWindTime(): number {
    return this.windTime;
  }

  /**
   * Set base wind speed
   */
  setWindSpeed(speed: number) {
    this.baseWindSpeed = Math.max(0, speed);
  }

  /**
   * Create shader uniforms for wind
   */
  getWindUniforms() {
    return {
      windDirection: { value: this.windDirection },
      windStrength: { value: this.windStrength },
      windTime: { value: this.windTime }
    };
  }
}
