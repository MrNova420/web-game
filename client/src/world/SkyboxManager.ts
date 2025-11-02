import * as THREE from 'three';

export class SkyboxManager {
  private scene: THREE.Scene;
  private textureLoader: THREE.TextureLoader;
  private currentSkybox: THREE.Mesh | null = null;

  private skyboxes = {
    day: '/extracted_assets/Skyboxes/BlueSkySkybox.png',
    sunset: '/extracted_assets/Skyboxes/SunsetSky.png',
    green: '/extracted_assets/Skyboxes/GreenSky.png',
    purple: '/extracted_assets/Skyboxes/PurplyBlueSky.png',
    default: '/extracted_assets/Skyboxes/SkySkybox.png'
  };

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
  }

  async loadSkybox(type: 'day' | 'sunset' | 'green' | 'purple' | 'default' = 'day') {
    // Remove existing skybox if any
    if (this.currentSkybox) {
      this.scene.remove(this.currentSkybox);
      this.currentSkybox.geometry.dispose();
      (this.currentSkybox.material as THREE.Material).dispose();
      this.currentSkybox = null;
    }

    const skyboxPath = this.skyboxes[type];
    
    try {
      const texture = await this.textureLoader.loadAsync(skyboxPath);
      
      // Create a large sphere for the skybox
      const geometry = new THREE.SphereGeometry(500, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide // Render inside of sphere
      });

      this.currentSkybox = new THREE.Mesh(geometry, material);
      this.scene.add(this.currentSkybox);
      
      console.log(`Skybox loaded: ${type}`);
    } catch (error) {
      console.error(`Failed to load skybox: ${type}`, error);
      // FIX: Don't add the skybox mesh if texture failed to load
      // Just use colored background as fallback
      this.scene.background = new THREE.Color(0x87ceeb);
      console.log('Using fallback sky color instead of skybox sphere');
    }
  }

  setSkyboxTime(hour: number) {
    // Automatically set skybox based on time of day
    if (hour >= 6 && hour < 18) {
      this.loadSkybox('day');
    } else if (hour >= 18 && hour < 20) {
      this.loadSkybox('sunset');
    } else {
      this.loadSkybox('purple');
    }
  }

  dispose() {
    if (this.currentSkybox) {
      this.scene.remove(this.currentSkybox);
      this.currentSkybox.geometry.dispose();
      (this.currentSkybox.material as THREE.Material).dispose();
      this.currentSkybox = null;
    }
  }
}
