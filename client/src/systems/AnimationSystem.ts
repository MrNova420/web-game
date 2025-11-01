import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

/**
 * AnimationSystem - Manages character animations using ONLY real animation files
 * Uses Universal_Animation_Library FBX animations
 */
export class AnimationSystem {
  private fbxLoader: FBXLoader;
  private animations = new Map<string, THREE.AnimationClip[]>();
  private mixers = new Map<string, THREE.AnimationMixer>();
  private actions = new Map<string, Map<string, THREE.AnimationAction>>();
  
  // Animation library path
  private animationLibraryPath = '/extracted_assets/Universal_Animation_Library/Unity/AnimationLibrary_Unity_Standard.fbx';
  private animationsLoaded = false;
  private animationClips: THREE.AnimationClip[] = [];

  constructor() {
    this.fbxLoader = new FBXLoader();
    this.loadAnimationLibrary();
  }

  /**
   * Load the animation library
   */
  private async loadAnimationLibrary() {
    try {
      const animLib = await this.fbxLoader.loadAsync(this.animationLibraryPath);
      
      if (animLib.animations && animLib.animations.length > 0) {
        this.animationClips = animLib.animations;
        this.animationsLoaded = true;
        console.log(`Loaded ${this.animationClips.length} animations from library`);
        
        // Log animation names for debugging
        this.animationClips.forEach((clip, index) => {
          console.log(`Animation ${index}: ${clip.name}`);
        });
      } else {
        console.warn('No animations found in library');
      }
    } catch (error) {
      console.error('Failed to load animation library:', error);
    }
  }

  /**
   * Setup animator for a character
   */
  setupCharacterAnimator(characterId: string, character: THREE.Group) {
    if (!this.animationsLoaded) {
      console.warn('Animations not loaded yet');
      return;
    }

    // Create animation mixer for this character
    const mixer = new THREE.AnimationMixer(character);
    this.mixers.set(characterId, mixer);
    
    // Create actions for each animation
    const characterActions = new Map<string, THREE.AnimationAction>();
    
    this.animationClips.forEach((clip) => {
      const action = mixer.clipAction(clip);
      characterActions.set(clip.name, action);
    });
    
    this.actions.set(characterId, characterActions);
    
    console.log(`Setup animator for character ${characterId} with ${this.animationClips.length} animations`);
  }

  /**
   * Play animation on character
   */
  playAnimation(characterId: string, animationName: string, loop: boolean = true) {
    const characterActions = this.actions.get(characterId);
    if (!characterActions) {
      console.warn('No actions found for character:', characterId);
      return;
    }

    // Stop all current animations
    characterActions.forEach((action) => {
      action.stop();
    });

    // Play requested animation
    const action = characterActions.get(animationName);
    if (action) {
      action.reset();
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      action.play();
      console.log(`Playing animation: ${animationName} on character ${characterId}`);
    } else {
      console.warn(`Animation not found: ${animationName}`);
    }
  }

  /**
   * Update all animation mixers
   */
  update(deltaTime: number) {
    this.mixers.forEach((mixer) => {
      mixer.update(deltaTime);
    });
  }

  /**
   * Get available animation names
   */
  getAvailableAnimations(): string[] {
    return this.animationClips.map(clip => clip.name);
  }

  /**
   * Check if animations are loaded
   */
  isLoaded(): boolean {
    return this.animationsLoaded;
  }

  /**
   * Remove character animator
   */
  removeCharacterAnimator(characterId: string) {
    this.mixers.delete(characterId);
    this.actions.delete(characterId);
  }
}
