import * as THREE from 'three';

/**
 * AdvancedSkySystem - Professional sky system using all 5 skyboxes
 * ENHANCEMENT: Dynamic day/night cycle with smooth skybox blending
 * Based on AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Section V
 */

interface SkyboxConfig {
  path: string;
  timeRange: [number, number];
  timeRange2?: [number, number];
  fogColor: THREE.Color;
  sunColor: THREE.Color;
  ambientColor: THREE.Color;
  intensity: number;
  special?: boolean;
}

interface SkyConfig {
  texture1: THREE.Texture | null;
  texture2: THREE.Texture | null;
  blend: number;
  fogColor: THREE.Color;
  intensity: number;
}

export class AdvancedSkySystem {
  private scene: THREE.Scene;
  private skyboxes = new Map<string, THREE.Texture>();
  private currentSkybox: THREE.Mesh | null = null;
  private skyMaterial: THREE.ShaderMaterial | null = null;
  private timeOfDay = 0.5; // 0-1 (0=midnight, 0.5=noon, 1=midnight)

  // ADVANCED: Load ALL your skybox assets
  private skyboxAssets: Record<string, SkyboxConfig> = {
    clearDay: {
      path: '/extracted_assets/Skyboxes/BlueSkySkybox.png',
      timeRange: [0.3, 0.7], // 6 AM to 6 PM
      fogColor: new THREE.Color(0xb8d4c8),
      sunColor: new THREE.Color(0xfff5e6),
      ambientColor: new THREE.Color(0.4, 0.5, 0.6),
      intensity: 1.5,
    },

    standard: {
      path: '/extracted_assets/Skyboxes/SkySkybox.png',
      timeRange: [0.25, 0.75],
      fogColor: new THREE.Color(0xc8d8e8),
      sunColor: new THREE.Color(0xfff8e8),
      ambientColor: new THREE.Color(0.45, 0.5, 0.55),
      intensity: 1.3,
    },

    mystical: {
      path: '/extracted_assets/Skyboxes/GreenSky.png',
      timeRange: [0.0, 1.0], // Can be used any time
      fogColor: new THREE.Color(0xa8c8b8),
      sunColor: new THREE.Color(0xe8f8e8),
      ambientColor: new THREE.Color(0.3, 0.5, 0.4),
      intensity: 1.2,
      special: true, // For magical areas
    },

    twilight: {
      path: '/extracted_assets/Skyboxes/PurplyBlueSky.png',
      timeRange: [0.2, 0.3], // Dawn
      timeRange2: [0.7, 0.8], // Dusk
      fogColor: new THREE.Color(0xb8a8c8),
      sunColor: new THREE.Color(0xf8d8e8),
      ambientColor: new THREE.Color(0.4, 0.3, 0.5),
      intensity: 1.0,
    },

    sunset: {
      path: '/extracted_assets/Skyboxes/SunsetSky.png',
      timeRange: [0.15, 0.25], // Sunrise
      timeRange2: [0.75, 0.85], // Sunset
      fogColor: new THREE.Color(0xe8c8a8),
      sunColor: new THREE.Color(0xffc080),
      ambientColor: new THREE.Color(0.6, 0.4, 0.3),
      intensity: 1.4,
    },
  };

  // Time control
  private timeSpeed = 0.0001; // Adjustable speed
  private isPaused = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /**
   * ADVANCED: Initialize sky system
   */
  async initialize(): Promise<void> {
    console.log('🌤️ [AdvancedSkySystem] Loading ALL skybox assets...');

    const loader = new THREE.TextureLoader();

    // Load all skyboxes in parallel
    const loadPromises = Object.entries(this.skyboxAssets).map(async ([name, config]) => {
      try {
        const texture = await loader.loadAsync(config.path);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.skyboxes.set(name, texture);
        console.log(`  ✓ Loaded: ${name}`);
        return true;
      } catch (error) {
        console.error(`  ✗ Failed to load ${name}:`, error);
        return false;
      }
    });

    await Promise.all(loadPromises);

    console.log(`✅ Loaded ${this.skyboxes.size}/5 skyboxes`);

    // Create sky sphere
    this.createSkySphere();

    // Set initial sky
    this.updateSky(0.5); // Noon
  }

  /**
   * Create sky sphere with custom shader
   */
  private createSkySphere(): void {
    // ADVANCED: Large sphere with custom shader for sky
    const skyGeometry = new THREE.SphereGeometry(500, 64, 64);

    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        skyTexture1: { value: null },
        skyTexture2: { value: null },
        blendFactor: { value: 0.0 },
        sunDirection: { value: new THREE.Vector3(0, 1, 0) },
        sunColor: { value: new THREE.Color(1, 1, 1) },
        sunSize: { value: 0.05 },
        sunIntensity: { value: 1.0 },
        atmosphereThickness: { value: 2.0 },
        horizonColor: { value: new THREE.Color(0.8, 0.8, 0.9) },
        zenithColor: { value: new THREE.Color(0.2, 0.4, 0.8) },
        exposure: { value: 1.0 },
      },

      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D skyTexture1;
        uniform sampler2D skyTexture2;
        uniform float blendFactor;
        uniform vec3 sunDirection;
        uniform vec3 sunColor;
        uniform float sunSize;
        uniform float sunIntensity;
        uniform float atmosphereThickness;
        uniform vec3 horizonColor;
        uniform vec3 zenithColor;
        uniform float exposure;
        
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        
        void main() {
          // Sample both skyboxes
          vec3 sky1 = texture2D(skyTexture1, vUv).rgb;
          vec3 sky2 = texture2D(skyTexture2, vUv).rgb;
          
          // Blend between skyboxes
          vec3 skyColor = mix(sky1, sky2, blendFactor);
          
          // ADVANCED: Add sun disc
          vec3 viewDir = normalize(vWorldPosition);
          float sunDot = dot(viewDir, sunDirection);
          float sunDisc = smoothstep(1.0 - sunSize, 1.0, sunDot);
          vec3 sunGlow = sunColor * sunDisc * sunIntensity;
          
          // ADVANCED: Atmospheric scattering around sun
          float sunScatter = pow(max(sunDot, 0.0), 4.0) * 0.3;
          vec3 scatterColor = sunColor * sunScatter;
          
          // ADVANCED: Horizon gradient
          float horizonBlend = abs(viewDir.y);
          vec3 atmosphereColor = mix(horizonColor, zenithColor, horizonBlend);
          
          // Combine all components
          vec3 finalColor = skyColor;
          finalColor += sunGlow;
          finalColor += scatterColor;
          finalColor = mix(finalColor, atmosphereColor, atmosphereThickness * 0.1);
          
          // Apply exposure
          finalColor *= exposure;
          
          // Tone mapping
          finalColor = finalColor / (finalColor + vec3(1.0));
          
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,

      side: THREE.BackSide,
      depthWrite: false,
    });

    this.currentSkybox = new THREE.Mesh(skyGeometry, this.skyMaterial);
    this.currentSkybox.renderOrder = -1; // Render first
    this.scene.add(this.currentSkybox);
  }

  /**
   * ADVANCED: Update sky based on time and conditions
   */
  updateSky(timeOfDay: number, weather: string = 'clear', biome: string = 'normal'): void {
    if (!this.skyMaterial) return;

    this.timeOfDay = timeOfDay;

    // ADVANCED: Select appropriate skyboxes based on time
    const skyConfig = this.selectSkyboxes(timeOfDay, weather, biome);

    // Update shader uniforms
    this.skyMaterial.uniforms.skyTexture1.value = skyConfig.texture1;
    this.skyMaterial.uniforms.skyTexture2.value = skyConfig.texture2;
    this.skyMaterial.uniforms.blendFactor.value = skyConfig.blend;

    // Update sun position
    const sunAngle = timeOfDay * Math.PI * 2;
    const sunDir = new THREE.Vector3(
      Math.sin(sunAngle) * 0.5,
      Math.cos(sunAngle),
      Math.sin(sunAngle) * 0.3
    ).normalize();
    this.skyMaterial.uniforms.sunDirection.value = sunDir;

    // Update sun color based on time
    const sunColor = this.getSunColor(timeOfDay);
    this.skyMaterial.uniforms.sunColor.value = sunColor;
    this.skyMaterial.uniforms.sunIntensity.value = skyConfig.intensity;

    // Update scene fog to match sky
    if (this.scene.fog instanceof THREE.Fog) {
      this.scene.fog.color.copy(skyConfig.fogColor);
    }
  }

  /**
   * Select appropriate skyboxes based on time and conditions
   */
  private selectSkyboxes(
    timeOfDay: number,
    weather: string,
    biome: string
  ): SkyConfig {
    // ADVANCED: Use mystical green sky for magical biomes
    if (biome === 'magical' || biome === 'enchanted') {
      return {
        texture1: this.skyboxes.get('mystical') || null,
        texture2: this.skyboxes.get('clearDay') || null,
        blend: 0.8,
        fogColor: this.skyboxAssets.mystical.fogColor,
        intensity: this.skyboxAssets.mystical.intensity,
      };
    }

    // ADVANCED: Time-based skybox selection

    // Sunrise (0.15 - 0.25)
    if (timeOfDay >= 0.15 && timeOfDay < 0.25) {
      const t = (timeOfDay - 0.15) / 0.1;
      return {
        texture1: this.skyboxes.get('sunset') || null,
        texture2: this.skyboxes.get('twilight') || null,
        blend: t,
        fogColor: this.lerpColor(
          this.skyboxAssets.sunset.fogColor,
          this.skyboxAssets.twilight.fogColor,
          t
        ),
        intensity: 1.2,
      };
    }

    // Dawn transition (0.25 - 0.3)
    if (timeOfDay >= 0.25 && timeOfDay < 0.3) {
      const t = (timeOfDay - 0.25) / 0.05;
      return {
        texture1: this.skyboxes.get('twilight') || null,
        texture2: this.skyboxes.get('clearDay') || null,
        blend: t,
        fogColor: this.lerpColor(
          this.skyboxAssets.twilight.fogColor,
          this.skyboxAssets.clearDay.fogColor,
          t
        ),
        intensity: 1.3,
      };
    }

    // Day (0.3 - 0.7)
    if (timeOfDay >= 0.3 && timeOfDay < 0.7) {
      return {
        texture1: this.skyboxes.get('clearDay') || null,
        texture2: this.skyboxes.get('standard') || null,
        blend: Math.sin(((timeOfDay - 0.3) / 0.4) * Math.PI) * 0.3,
        fogColor: this.skyboxAssets.clearDay.fogColor,
        intensity: 1.5,
      };
    }

    // Dusk transition (0.7 - 0.75)
    if (timeOfDay >= 0.7 && timeOfDay < 0.75) {
      const t = (timeOfDay - 0.7) / 0.05;
      return {
        texture1: this.skyboxes.get('clearDay') || null,
        texture2: this.skyboxes.get('twilight') || null,
        blend: t,
        fogColor: this.lerpColor(
          this.skyboxAssets.clearDay.fogColor,
          this.skyboxAssets.twilight.fogColor,
          t
        ),
        intensity: 1.2,
      };
    }

    // Sunset (0.75 - 0.85)
    if (timeOfDay >= 0.75 && timeOfDay < 0.85) {
      const t = (timeOfDay - 0.75) / 0.1;
      return {
        texture1: this.skyboxes.get('twilight') || null,
        texture2: this.skyboxes.get('sunset') || null,
        blend: t,
        fogColor: this.lerpColor(
          this.skyboxAssets.twilight.fogColor,
          this.skyboxAssets.sunset.fogColor,
          t
        ),
        intensity: 1.3,
      };
    }

    // Night (0.85 - 1.0 and 0.0 - 0.15)
    // Use twilight skybox darkened
    return {
      texture1: this.skyboxes.get('twilight') || null,
      texture2: this.skyboxes.get('twilight') || null,
      blend: 0.0,
      fogColor: new THREE.Color(0.05, 0.05, 0.1),
      intensity: 0.3,
    };
  }

  /**
   * Get sun color based on time of day
   */
  private getSunColor(timeOfDay: number): THREE.Color {
    // ADVANCED: Realistic sun color based on time

    // Sunrise/Sunset: orange-red
    if (timeOfDay < 0.25 || timeOfDay > 0.75) {
      return new THREE.Color(1.0, 0.6, 0.3);
    }

    // Day: white-yellow
    if (timeOfDay >= 0.3 && timeOfDay <= 0.7) {
      return new THREE.Color(1.0, 0.98, 0.9);
    }

    // Transition periods: blend
    if (timeOfDay >= 0.25 && timeOfDay < 0.3) {
      const t = (timeOfDay - 0.25) / 0.05;
      return this.lerpColor(new THREE.Color(1.0, 0.6, 0.3), new THREE.Color(1.0, 0.98, 0.9), t);
    }

    if (timeOfDay > 0.7 && timeOfDay <= 0.75) {
      const t = (timeOfDay - 0.7) / 0.05;
      return this.lerpColor(new THREE.Color(1.0, 0.98, 0.9), new THREE.Color(1.0, 0.6, 0.3), t);
    }

    return new THREE.Color(1, 1, 1);
  }

  /**
   * Lerp between two colors
   */
  private lerpColor(color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color {
    return new THREE.Color(
      color1.r * (1 - t) + color2.r * t,
      color1.g * (1 - t) + color2.g * t,
      color1.b * (1 - t) + color2.b * t
    );
  }

  /**
   * ADVANCED: Dynamic time of day cycle
   */
  update(deltaTime: number): void {
    if (this.isPaused) return;

    // Advance time
    this.timeOfDay += this.timeSpeed * deltaTime;
    if (this.timeOfDay > 1.0) this.timeOfDay -= 1.0;

    // Update sky
    this.updateSky(this.timeOfDay);
  }

  /**
   * ADVANCED: Set specific time instantly
   */
  setTime(timeOfDay: number): void {
    this.timeOfDay = Math.max(0, Math.min(1, timeOfDay));
    this.updateSky(this.timeOfDay);
  }

  /**
   * Convert hour (0-24) to timeOfDay (0-1)
   */
  setTimeOfDay(hour: number): void {
    this.setTime(hour / 24);
  }

  // Convenience methods
  setSunrise(): void {
    this.setTime(0.2);
  }
  setNoon(): void {
    this.setTime(0.5);
  }
  setSunset(): void {
    this.setTime(0.8);
  }
  setMidnight(): void {
    this.setTime(0.0);
  }

  // Control time speed
  setTimeSpeed(speed: number): void {
    this.timeSpeed = speed;
  }

  pauseTime(): void {
    this.isPaused = true;
  }
  resumeTime(): void {
    this.isPaused = false;
  }

  /**
   * Get current time of day
   */
  getTimeOfDay(): number {
    return this.timeOfDay;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    if (this.currentSkybox) {
      this.scene.remove(this.currentSkybox);
      this.currentSkybox.geometry.dispose();
      if (this.skyMaterial) {
        this.skyMaterial.dispose();
      }
    }
    this.skyboxes.forEach((texture) => texture.dispose());
    this.skyboxes.clear();
    console.log('[AdvancedSkySystem] Disposed');
  }
}
