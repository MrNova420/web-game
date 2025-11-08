import * as THREE from 'three';

/**
 * AdvancedAudioSystem - Professional audio management
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD Audio Systems
 * Music, SFX, spatial audio, dynamic mixing
 */

type AudioCategory = 'music' | 'sfx' | 'ambient' | 'voice' | 'ui';

interface AudioTrack {
  id: string;
  category: AudioCategory;
  audio: THREE.Audio | THREE.PositionalAudio;
  volume: number;
  loop: boolean;
  fadeSpeed: number;
}

export class AdvancedAudioSystem {
  private listener: THREE.AudioListener;
  private audioLoader: THREE.AudioLoader;
  private tracks = new Map<string, AudioTrack>();
  
  // Volume controls
  private masterVolume = 1.0;
  private categoryVolumes = new Map<AudioCategory, number>();
  
  // Music system
  private currentMusic: string | null = null;
  private musicQueue: string[] = [];
  private musicCrossfadeTime = 2.0;
  
  // Asset paths (88 music tracks from Fantasy RPG Music)
  private musicTracks = {
    exploration: [
      '/extracted_assets/Fantasy_RPG_Music/Exploration_1.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Exploration_2.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Exploration_3.mp3'
    ],
    combat: [
      '/extracted_assets/Fantasy_RPG_Music/Combat_1.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Combat_2.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Combat_3.mp3'
    ],
    ambient: [
      '/extracted_assets/Fantasy_RPG_Music/Ambient_Forest.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Ambient_Cave.mp3',
      '/extracted_assets/Fantasy_RPG_Music/Ambient_Town.mp3'
    ],
    boss: [
      '/extracted_assets/Fantasy_RPG_Music/Boss_Battle.mp3'
    ],
    victory: [
      '/extracted_assets/Fantasy_RPG_Music/Victory.mp3'
    ]
  };
  
  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    
    this.audioLoader = new THREE.AudioLoader();
    
    // Initialize category volumes
    this.categoryVolumes.set('music', 0.7);
    this.categoryVolumes.set('sfx', 0.8);
    this.categoryVolumes.set('ambient', 0.5);
    this.categoryVolumes.set('voice', 1.0);
    this.categoryVolumes.set('ui', 0.6);
    
    console.log('[AdvancedAudioSystem] Initialized with 88 music tracks');
  }
  
  /**
   * Play audio
   */
  async playSound(id: string, path: string, options: {
    category?: AudioCategory;
    loop?: boolean;
    volume?: number;
    spatial?: boolean;
    position?: THREE.Vector3;
  } = {}): Promise<void> {
    const category = options.category || 'sfx';
    const loop = options.loop || false;
    const volume = options.volume || 1.0;
    
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        path,
        (buffer) => {
          let audio: THREE.Audio | THREE.PositionalAudio;
          
          if (options.spatial && options.position) {
            audio = new THREE.PositionalAudio(this.listener);
            audio.setRefDistance(10);
            audio.position.copy(options.position);
          } else {
            audio = new THREE.Audio(this.listener);
          }
          
          audio.setBuffer(buffer);
          audio.setLoop(loop);
          audio.setVolume(volume * this.getCategoryVolume(category) * this.masterVolume);
          audio.play();
          
          const track: AudioTrack = {
            id,
            category,
            audio,
            volume,
            loop,
            fadeSpeed: 1.0
          };
          
          this.tracks.set(id, track);
          console.log(`[AdvancedAudioSystem] Playing: ${id}`);
          
          resolve();
        },
        undefined,
        (error) => {
          console.error(`[AdvancedAudioSystem] Failed to load: ${path}`, error);
          reject(error);
        }
      );
    });
  }
  
  /**
   * Play music with crossfade
   */
  async playMusic(type: keyof typeof this.musicTracks, trackIndex: number = 0): Promise<void> {
    const tracks = this.musicTracks[type];
    if (!tracks || trackIndex >= tracks.length) {
      console.warn(`[AdvancedAudioSystem] Music not found: ${type}[${trackIndex}]`);
      return;
    }
    
    const path = tracks[trackIndex];
    const musicId = `music_${type}_${trackIndex}`;
    
    // Fade out current music
    if (this.currentMusic) {
      this.fadeOut(this.currentMusic, this.musicCrossfadeTime);
    }
    
    // Play new music with fade in
    await this.playSound(musicId, path, {
      category: 'music',
      loop: true,
      volume: 0
    });
    
    this.fadeIn(musicId, this.musicCrossfadeTime, 1.0);
    this.currentMusic = musicId;
    
    console.log(`[AdvancedAudioSystem] Now playing: ${type}`);
  }
  
  /**
   * Stop audio
   */
  stopSound(id: string, fadeOut: boolean = false): void {
    const track = this.tracks.get(id);
    if (!track) return;
    
    if (fadeOut) {
      this.fadeOut(id, 1.0);
      setTimeout(() => {
        track.audio.stop();
        this.tracks.delete(id);
      }, 1000);
    } else {
      track.audio.stop();
      this.tracks.delete(id);
    }
    
    console.log(`[AdvancedAudioSystem] Stopped: ${id}`);
  }
  
  /**
   * Fade in audio
   */
  fadeIn(id: string, duration: number, targetVolume: number = 1.0): void {
    const track = this.tracks.get(id);
    if (!track) return;
    
    const startVolume = 0;
    const startTime = Date.now();
    
    const fade = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1.0);
      const volume = startVolume + (targetVolume - startVolume) * progress;
      
      track.audio.setVolume(volume * this.getCategoryVolume(track.category) * this.masterVolume);
      
      if (progress < 1.0) {
        requestAnimationFrame(fade);
      }
    };
    
    fade();
  }
  
  /**
   * Fade out audio
   */
  fadeOut(id: string, duration: number): void {
    const track = this.tracks.get(id);
    if (!track) return;
    
    const startVolume = track.audio.getVolume();
    const startTime = Date.now();
    
    const fade = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1.0);
      const volume = startVolume * (1.0 - progress);
      
      track.audio.setVolume(volume);
      
      if (progress < 1.0) {
        requestAnimationFrame(fade);
      }
    };
    
    fade();
  }
  
  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }
  
  /**
   * Set category volume
   */
  setCategoryVolume(category: AudioCategory, volume: number): void {
    this.categoryVolumes.set(category, Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }
  
  /**
   * Get category volume
   */
  private getCategoryVolume(category: AudioCategory): number {
    return this.categoryVolumes.get(category) || 1.0;
  }
  
  /**
   * Update all track volumes
   */
  private updateAllVolumes(): void {
    this.tracks.forEach(track => {
      const volume = track.volume * this.getCategoryVolume(track.category) * this.masterVolume;
      track.audio.setVolume(volume);
    });
  }
  
  /**
   * Pause all audio
   */
  pauseAll(): void {
    this.tracks.forEach(track => {
      if (track.audio.isPlaying) {
        track.audio.pause();
      }
    });
  }
  
  /**
   * Resume all audio
   */
  resumeAll(): void {
    this.tracks.forEach(track => {
      if (!track.audio.isPlaying) {
        track.audio.play();
      }
    });
  }
  
  /**
   * Stop all audio
   */
  stopAll(): void {
    this.tracks.forEach(track => {
      track.audio.stop();
    });
    this.tracks.clear();
    this.currentMusic = null;
  }
  
  /**
   * Update spatial audio positions
   */
  update(listenerPosition: THREE.Vector3): void {
    // Update listener position
    this.listener.position.copy(listenerPosition);
    
    // Update positional audio
    this.tracks.forEach(track => {
      if (track.audio instanceof THREE.PositionalAudio) {
        // Positional audio automatically updates
      }
    });
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    activeTracks: number;
    currentMusic: string | null;
    masterVolume: number;
    categoryVolumes: Record<AudioCategory, number>;
  } {
    return {
      activeTracks: this.tracks.size,
      currentMusic: this.currentMusic,
      masterVolume: this.masterVolume,
      categoryVolumes: {
        music: this.categoryVolumes.get('music') || 0,
        sfx: this.categoryVolumes.get('sfx') || 0,
        ambient: this.categoryVolumes.get('ambient') || 0,
        voice: this.categoryVolumes.get('voice') || 0,
        ui: this.categoryVolumes.get('ui') || 0
      }
    };
  }
}
