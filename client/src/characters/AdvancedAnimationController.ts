import * as THREE from 'three';

/**
 * AdvancedAnimationController - Professional character animation system
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Character Systems
 * Manages animation blending, state machines, and smooth transitions
 */

interface AnimationState {
  name: string;
  clip: THREE.AnimationClip;
  weight: number;
  timeScale: number;
  loop: THREE.AnimationActionLoopStyles;
}

interface AnimationTransition {
  from: string;
  to: string;
  duration: number;
  conditions: (() => boolean)[];
}

export class AdvancedAnimationController {
  private mixer: THREE.AnimationMixer;
  private animations = new Map<string, THREE.AnimationAction>();
  private currentState: string = 'idle';
  private previousState: string = 'idle';
  private transitionDuration = 0.3; // seconds
  
  // Animation states
  private states = new Map<string, AnimationState>();
  private transitions: AnimationTransition[] = [];
  
  // Blending
  private isTransitioning = false;
  private transitionTime = 0;
  
  // Character reference
  private character: THREE.Object3D;
  
  constructor(character: THREE.Object3D) {
    this.character = character;
    this.mixer = new THREE.AnimationMixer(character);
    
    console.log('[AdvancedAnimationController] Initialized for character');
  }
  
  /**
   * Add animation clip to controller
   */
  addAnimation(name: string, clip: THREE.AnimationClip, options: {
    timeScale?: number;
    loop?: THREE.AnimationActionLoopStyles;
  } = {}): void {
    const action = this.mixer.clipAction(clip);
    action.timeScale = options.timeScale || 1.0;
    action.loop = options.loop || THREE.LoopRepeat;
    action.clampWhenFinished = true;
    
    this.animations.set(name, action);
    this.states.set(name, {
      name,
      clip,
      weight: name === 'idle' ? 1.0 : 0.0,
      timeScale: options.timeScale || 1.0,
      loop: options.loop || THREE.LoopRepeat
    });
    
    console.log(`[AdvancedAnimationController] Added animation: ${name}`);
  }
  
  /**
   * Add transition between states
   */
  addTransition(from: string, to: string, duration: number = 0.3, conditions: (() => boolean)[] = []): void {
    this.transitions.push({ from, to, duration, conditions });
  }
  
  /**
   * Set up default animation states for humanoid character
   */
  setupDefaultStates(): void {
    // Define common transitions
    this.addTransition('idle', 'walk', 0.2);
    this.addTransition('walk', 'idle', 0.2);
    this.addTransition('walk', 'run', 0.3);
    this.addTransition('run', 'walk', 0.3);
    this.addTransition('idle', 'jump', 0.1);
    this.addTransition('walk', 'jump', 0.1);
    this.addTransition('run', 'jump', 0.1);
    this.addTransition('jump', 'idle', 0.2);
    this.addTransition('idle', 'attack', 0.1);
    this.addTransition('attack', 'idle', 0.2);
    this.addTransition('idle', 'hit', 0.05);
    this.addTransition('hit', 'idle', 0.3);
    this.addTransition('idle', 'death', 0.5);
    
    console.log('[AdvancedAnimationController] Default state machine configured');
  }
  
  /**
   * Transition to new animation state with blending
   */
  transitionTo(stateName: string, forceDuration?: number): void {
    if (!this.animations.has(stateName)) {
      console.warn(`[AdvancedAnimationController] Animation not found: ${stateName}`);
      return;
    }
    
    if (this.currentState === stateName) return;
    
    const duration = forceDuration !== undefined ? forceDuration : this.transitionDuration;
    
    // Store previous state
    this.previousState = this.currentState;
    this.currentState = stateName;
    
    // Start transition
    this.isTransitioning = true;
    this.transitionTime = 0;
    
    // Setup new animation
    const newAction = this.animations.get(stateName)!;
    newAction.reset();
    newAction.setEffectiveWeight(0);
    newAction.play();
    
    // Fade out old, fade in new
    if (this.previousState && this.animations.has(this.previousState)) {
      const oldAction = this.animations.get(this.previousState)!;
      newAction.crossFadeFrom(oldAction, duration, true);
    }
    
    console.log(`[AdvancedAnimationController] Transitioning: ${this.previousState} -> ${stateName}`);
  }
  
  /**
   * Update animation system
   */
  update(deltaTime: number): void {
    // Update mixer
    this.mixer.update(deltaTime);
    
    // Check for automatic transitions based on conditions
    this.checkTransitions();
    
    // Update transition progress
    if (this.isTransitioning) {
      this.transitionTime += deltaTime;
      if (this.transitionTime >= this.transitionDuration) {
        this.isTransitioning = false;
      }
    }
  }
  
  /**
   * Check transition conditions
   */
  private checkTransitions(): void {
    for (const transition of this.transitions) {
      if (transition.from === this.currentState) {
        // Check all conditions
        const allConditionsMet = transition.conditions.every(condition => condition());
        if (allConditionsMet) {
          this.transitionTo(transition.to, transition.duration);
          break;
        }
      }
    }
  }
  
  /**
   * Set animation speed
   */
  setSpeed(stateName: string, speed: number): void {
    const action = this.animations.get(stateName);
    if (action) {
      action.timeScale = speed;
    }
  }
  
  /**
   * Get current animation state
   */
  getCurrentState(): string {
    return this.currentState;
  }
  
  /**
   * Check if transitioning
   */
  isInTransition(): boolean {
    return this.isTransitioning;
  }
  
  /**
   * Play one-shot animation (doesn't change state)
   */
  playOnce(stateName: string, onComplete?: () => void): void {
    const action = this.animations.get(stateName);
    if (!action) {
      console.warn(`[AdvancedAnimationController] Animation not found: ${stateName}`);
      return;
    }
    
    action.reset();
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    
    if (onComplete) {
      const onFinished = (e: any) => {
        if (e.action === action) {
          onComplete();
          this.mixer.removeEventListener('finished', onFinished);
        }
      };
      this.mixer.addEventListener('finished', onFinished);
    }
  }
  
  /**
   * Blend multiple animations (e.g., aiming while walking)
   */
  blendAnimations(primaryState: string, secondaryState: string, blendWeight: number): void {
    const primary = this.animations.get(primaryState);
    const secondary = this.animations.get(secondaryState);
    
    if (primary && secondary) {
      primary.setEffectiveWeight(1 - blendWeight);
      secondary.setEffectiveWeight(blendWeight);
    }
  }
  
  /**
   * Stop all animations
   */
  stopAll(): void {
    this.animations.forEach(action => action.stop());
    this.currentState = 'idle';
  }
  
  /**
   * Pause all animations
   */
  pause(): void {
    this.animations.forEach(action => action.paused = true);
  }
  
  /**
   * Resume all animations
   */
  resume(): void {
    this.animations.forEach(action => action.paused = false);
  }
  
  /**
   * Get animation progress (0-1)
   */
  getProgress(stateName: string): number {
    const action = this.animations.get(stateName);
    if (!action) return 0;
    
    const clip = this.states.get(stateName)?.clip;
    if (!clip) return 0;
    
    return action.time / clip.duration;
  }
  
  /**
   * Set animation time directly
   */
  setTime(stateName: string, time: number): void {
    const action = this.animations.get(stateName);
    if (action) {
      action.time = time;
    }
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    currentState: string;
    animationCount: number;
    isTransitioning: boolean;
    transitionProgress: number;
  } {
    return {
      currentState: this.currentState,
      animationCount: this.animations.size,
      isTransitioning: this.isTransitioning,
      transitionProgress: this.isTransitioning ? this.transitionTime / this.transitionDuration : 0
    };
  }
  
  /**
   * Dispose resources
   */
  dispose(): void {
    this.mixer.stopAllAction();
    this.animations.clear();
    this.states.clear();
    this.transitions = [];
    console.log('[AdvancedAnimationController] Disposed');
  }
}
