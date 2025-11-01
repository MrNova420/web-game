import * as THREE from 'three';
import { SkyboxManager } from './SkyboxManager';

export class DayNightCycle {
  private timeOfDay: number = 12; // 0-24 hours, starting at noon
  private daySpeed: number = 0.1; // How fast time passes (higher = faster)
  private directionalLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private skyboxManager: SkyboxManager;

  constructor(
    directionalLight: THREE.DirectionalLight,
    ambientLight: THREE.AmbientLight,
    skyboxManager: SkyboxManager
  ) {
    this.directionalLight = directionalLight;
    this.ambientLight = ambientLight;
    this.skyboxManager = skyboxManager;
  }

  update(deltaTime: number) {
    // Advance time
    this.timeOfDay += deltaTime * this.daySpeed;
    if (this.timeOfDay >= 24) {
      this.timeOfDay -= 24;
    }

    // Update lighting based on time of day
    this.updateLighting();
    
    // Update skybox every hour
    if (Math.floor(this.timeOfDay) % 6 === 0) {
      this.updateSkybox();
    }
  }

  private updateLighting() {
    // Calculate sun position based on time
    const angle = (this.timeOfDay / 24) * Math.PI * 2 - Math.PI / 2;
    const sunHeight = Math.sin(angle);
    
    // Sun moves in an arc across the sky
    const sunX = Math.cos(angle) * 100;
    const sunY = Math.max(sunHeight * 100, -50);
    const sunZ = 50;
    
    this.directionalLight.position.set(sunX, sunY, sunZ);

    // Adjust light intensity based on time of day
    let intensity = 0.8;
    let ambientIntensity = 0.5;
    
    // Dawn (5-7)
    if (this.timeOfDay >= 5 && this.timeOfDay < 7) {
      const t = (this.timeOfDay - 5) / 2;
      intensity = 0.3 + t * 0.5;
      ambientIntensity = 0.2 + t * 0.3;
    }
    // Day (7-17)
    else if (this.timeOfDay >= 7 && this.timeOfDay < 17) {
      intensity = 0.8;
      ambientIntensity = 0.5;
    }
    // Dusk (17-19)
    else if (this.timeOfDay >= 17 && this.timeOfDay < 19) {
      const t = (this.timeOfDay - 17) / 2;
      intensity = 0.8 - t * 0.5;
      ambientIntensity = 0.5 - t * 0.3;
    }
    // Night (19-5)
    else {
      intensity = 0.3;
      ambientIntensity = 0.2;
    }

    this.directionalLight.intensity = intensity;
    this.ambientLight.intensity = ambientIntensity;

    // Color temperature: warmer at dawn/dusk, cooler at noon, blue at night
    if (this.timeOfDay >= 5 && this.timeOfDay < 7) {
      // Dawn - orange/pink
      this.directionalLight.color.setHex(0xffaa88);
      this.ambientLight.color.setHex(0xffccaa);
    } else if (this.timeOfDay >= 7 && this.timeOfDay < 17) {
      // Day - white/yellow
      this.directionalLight.color.setHex(0xfffef0);
      this.ambientLight.color.setHex(0xffffff);
    } else if (this.timeOfDay >= 17 && this.timeOfDay < 19) {
      // Dusk - orange/red
      this.directionalLight.color.setHex(0xff7744);
      this.ambientLight.color.setHex(0xffaa88);
    } else {
      // Night - blue
      this.directionalLight.color.setHex(0x8888ff);
      this.ambientLight.color.setHex(0x444466);
    }
  }

  private updateSkybox() {
    // Update skybox based on time of day
    if (this.timeOfDay >= 6 && this.timeOfDay < 18) {
      this.skyboxManager.loadSkybox('day');
    } else if (this.timeOfDay >= 18 && this.timeOfDay < 20) {
      this.skyboxManager.loadSkybox('sunset');
    } else {
      this.skyboxManager.loadSkybox('purple');
    }
  }

  getTimeOfDay(): number {
    return this.timeOfDay;
  }

  setTimeOfDay(hour: number) {
    this.timeOfDay = Math.max(0, Math.min(24, hour));
    this.updateLighting();
    this.updateSkybox();
  }

  setDaySpeed(speed: number) {
    this.daySpeed = speed;
  }
}
