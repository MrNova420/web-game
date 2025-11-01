import * as THREE from 'three';

/**
 * EnvironmentEffects - Environmental immersion and visual polish
 * Adds footstep sounds, ambient effects, shaders, and atmosphere
 */
export class EnvironmentEffects {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private audioContext: AudioContext;
  private footstepSounds: Map<string, AudioBuffer> = new Map();
  private ambientAudio: HTMLAudioElement | null = null;
  private windAudio: HTMLAudioElement | null = null;
  
  // Shader effects
  private composer: any = null; // EffectComposer
  private aoPass: any = null; // SSAOPass
  private dofPass: any = null; // DepthOfFieldPass
  private motionBlurPass: any = null;
  
  // Wind system
  private windStrength: number = 0.3;
  private windDirection: THREE.Vector2 = new THREE.Vector2(1, 0);
  private windTime: number = 0;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.audioContext = new AudioContext();
    
    this.loadFootstepSounds();
    this.setupShaders();
    this.setupAmbientAudio();
  }
  
  private async loadFootstepSounds(): Promise<void> {
    // Footstep sounds for different terrain types
    const terrainTypes = ['dirt', 'grass', 'stone', 'wood', 'metal'];
    
    // In a real implementation, these would load from actual audio files
    // For now, we'll create placeholder entries
    terrainTypes.forEach(type => {
      // Would load: `/extracted_assets/Fantasy_RPG_Music/footstep_${type}.wav`
      this.footstepSounds.set(type, new AudioBuffer({
        length: 1,
        numberOfChannels: 1,
        sampleRate: 44100
      }));
    });
  }
  
  private setupShaders(): void {
    // Setup post-processing effects
    // Note: Requires THREE.EffectComposer and related passes
    
    // Ambient Occlusion
    // this.aoPass = new SSAOPass(scene, camera, width, height);
    // this.aoPass.kernelRadius = 16;
    
    // Depth of Field
    // this.dofPass = new DepthOfFieldPass(scene, camera, {
    //   focus: 10.0,
    //   aperture: 0.025,
    //   maxblur: 0.01
    // });
    
    // Motion Blur
    // this.motionBlurPass = new MotionBlurPass();
  }
  
  private setupAmbientAudio(): void {
    // Setup ambient background sounds
    this.ambientAudio = new Audio();
    this.windAudio = new Audio();
    
    // Set volumes
    this.ambientAudio.volume = 0.3;
    this.windAudio.volume = 0.2;
    this.windAudio.loop = true;
  }
  
  /**
   * Play footstep sound based on terrain type
   */
  public playFootstep(terrainType: string = 'grass'): void {
    const buffer = this.footstepSounds.get(terrainType);
    if (!buffer) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    // Add volume variation
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = 0.5 + Math.random() * 0.3;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }
  
  /**
   * Update ambient audio based on time of day
   */
  public updateAmbientAudio(timeOfDay: number): void {
    if (!this.ambientAudio) return;
    
    // Different ambient tracks for different times
    let trackName = '';
    if (timeOfDay < 6 || timeOfDay > 20) {
      trackName = 'night_ambient'; // Crickets, owls
    } else if (timeOfDay < 12) {
      trackName = 'morning_ambient'; // Birds chirping
    } else if (timeOfDay < 18) {
      trackName = 'day_ambient'; // Birds, rustling
    } else {
      trackName = 'evening_ambient'; // Transition sounds
    }
    
    // Would load from: `/extracted_assets/Fantasy_RPG_Music/${trackName}.wav`
    // this.ambientAudio.src = path;
    // this.ambientAudio.play();
  }
  
  /**
   * Update wind effects
   */
  public updateWind(deltaTime: number): void {
    this.windTime += deltaTime;
    
    // Vary wind strength over time
    this.windStrength = 0.2 + Math.sin(this.windTime * 0.5) * 0.1;
    
    // Rotate wind direction slowly
    const angle = Math.sin(this.windTime * 0.1) * Math.PI * 0.25;
    this.windDirection.set(Math.cos(angle), Math.sin(angle));
    
    // Update wind audio volume
    if (this.windAudio) {
      this.windAudio.volume = this.windStrength * 0.3;
    }
  }
  
  /**
   * Apply wind animation to objects (grass, trees)
   */
  public applyWindToObject(object: THREE.Object3D, intensity: number = 1.0): void {
    if (!object.userData.originalPosition) {
      object.userData.originalPosition = object.position.clone();
    }
    
    const windEffect = new THREE.Vector3(
      this.windDirection.x * this.windStrength * intensity,
      0,
      this.windDirection.y * this.windStrength * intensity
    );
    
    // Sway animation
    const sway = Math.sin(this.windTime * 2 + object.position.x + object.position.z);
    windEffect.multiplyScalar(sway * 0.5);
    
    object.position.copy(object.userData.originalPosition).add(windEffect);
  }
  
  /**
   * Set weather effects
   */
  public setWeather(weatherType: 'clear' | 'rain' | 'snow' | 'fog'): void {
    switch (weatherType) {
      case 'rain':
        this.windStrength = 0.6;
        if (this.windAudio) {
          this.windAudio.volume = 0.4;
        }
        break;
      case 'snow':
        this.windStrength = 0.3;
        break;
      case 'fog':
        this.windStrength = 0.1;
        // Adjust fog density if using FogExp2
        if (this.scene.fog && this.scene.fog instanceof THREE.FogExp2) {
          this.scene.fog.density = 0.02;
        }
        break;
      default:
        this.windStrength = 0.2;
    }
  }
  
  /**
   * Enable/disable ambient occlusion
   */
  public setAmbientOcclusion(enabled: boolean): void {
    if (this.aoPass) {
      this.aoPass.enabled = enabled;
    }
  }
  
  /**
   * Enable/disable depth of field
   */
  public setDepthOfField(enabled: boolean, focusDistance: number = 10): void {
    if (this.dofPass) {
      this.dofPass.enabled = enabled;
      this.dofPass.uniforms.focus.value = focusDistance;
    }
  }
  
  /**
   * Enable/disable motion blur
   */
  public setMotionBlur(enabled: boolean): void {
    if (this.motionBlurPass) {
      this.motionBlurPass.enabled = enabled;
    }
  }
  
  /**
   * Update all effects (call every frame)
   */
  public update(deltaTime: number): void {
    this.updateWind(deltaTime);
    
    // Update composer if available
    if (this.composer) {
      this.composer.render(deltaTime);
    }
  }
  
  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.ambientAudio) {
      this.ambientAudio.pause();
      this.ambientAudio = null;
    }
    if (this.windAudio) {
      this.windAudio.pause();
      this.windAudio = null;
    }
    this.audioContext.close();
  }
}
