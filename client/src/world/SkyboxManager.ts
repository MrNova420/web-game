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
    
    // FIX: Properly load skybox texture, no fallback - must work!
    const texture = await this.textureLoader.loadAsync(skyboxPath);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Create a large sphere for the skybox
    const geometry = new THREE.SphereGeometry(500, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide, // Render inside of sphere
      depthWrite: false
    });

    this.currentSkybox = new THREE.Mesh(geometry, material);
    this.currentSkybox.renderOrder = -1; // Render skybox first
    this.scene.add(this.currentSkybox);
    
    console.log(`[SkyboxManager] Skybox loaded successfully: ${type}`);
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
