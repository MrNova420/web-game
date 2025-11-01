import * as THREE from 'three';

/**
 * AudioSystem - Manages game audio using ONLY real music files
 * Uses Fantasy_RPG_Music WAV files
 */
export class AudioSystem {
  private listener: THREE.AudioListener;
  private audioLoader: THREE.AudioLoader;
  private currentMusic: THREE.Audio | null = null;
  private soundEffects = new Map<string, THREE.Audio>();
  private musicVolume = 0.5;
  private sfxVolume = 0.7;
  
  // Music tracks from your assets
  private musicTracks = {
    ambient: {
      light: [
        '/extracted_assets/Fantasy_RPG_Music/wav/Light Ambient 1 (Loop).wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Light Ambient 4 (Loop).wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Light Ambient 5 (Loop).wav'
      ],
      normal: [
        '/extracted_assets/Fantasy_RPG_Music/wav/Ambient 1.wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Ambient 4.wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Ambient 7.wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Ambient 9.wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Ambient 10 .wav'
      ],
      night: [
        '/extracted_assets/Fantasy_RPG_Music/wav/Night Ambient 2 (Loop).wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Night Ambient 3 (Loop).wav',
        '/extracted_assets/Fantasy_RPG_Music/wav/Night Ambient 5 (Loop).wav'
      ]
    },
    combat: [
      '/extracted_assets/Fantasy_RPG_Music/wav/Action 1 (Loop).wav',
      '/extracted_assets/Fantasy_RPG_Music/wav/Action 4 (Loop).wav'
    ],
    victory: '/extracted_assets/Fantasy_RPG_Music/wav/Victory.wav',
    complete: '/extracted_assets/Fantasy_RPG_Music/wav/Complete.wav'
  };

  constructor(camera: THREE.Camera) {
    this.listener = new THREE.AudioListener();
    camera.add(this.listener);
    this.audioLoader = new THREE.AudioLoader();
    
    console.log('AudioSystem initialized');
  }

  /**
   * Play background music
   */
  async playMusic(type: 'ambient_light' | 'ambient_normal' | 'ambient_night' | 'combat', loop: boolean = true) {
    // Stop current music
    this.stopMusic();

    try {
      let trackPath: string;
      
      // Select track based on type
      if (type === 'ambient_light') {
        const tracks = this.musicTracks.ambient.light;
        trackPath = tracks[Math.floor(Math.random() * tracks.length)];
      } else if (type === 'ambient_normal') {
        const tracks = this.musicTracks.ambient.normal;
        trackPath = tracks[Math.floor(Math.random() * tracks.length)];
      } else if (type === 'ambient_night') {
        const tracks = this.musicTracks.ambient.night;
        trackPath = tracks[Math.floor(Math.random() * tracks.length)];
      } else { // combat
        const tracks = this.musicTracks.combat;
        trackPath = tracks[Math.floor(Math.random() * tracks.length)];
      }

      // Load and play
      this.currentMusic = new THREE.Audio(this.listener);
      const buffer = await this.audioLoader.loadAsync(trackPath);
      
      this.currentMusic.setBuffer(buffer);
      this.currentMusic.setLoop(loop);
      this.currentMusic.setVolume(this.musicVolume);
      this.currentMusic.play();
      
      console.log(`Playing music: ${type}`);
      
    } catch (error) {
      console.error('Failed to load music:', error);
    }
  }

  /**
   * Stop current music
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Play sound effect (victory, complete, etc.)
   */
  async playSoundEffect(type: 'victory' | 'complete') {
    try {
      const sound = new THREE.Audio(this.listener);
      const trackPath = type === 'victory' ? this.musicTracks.victory : this.musicTracks.complete;
      
      const buffer = await this.audioLoader.loadAsync(trackPath);
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(this.sfxVolume);
      sound.play();
      
      console.log(`Playing sound effect: ${type}`);
      
    } catch (error) {
      console.error('Failed to play sound effect:', error);
    }
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.musicVolume);
    }
  }

  /**
   * Set sound effects volume
   */
  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute/unmute music
   */
  toggleMusicMute() {
    if (this.currentMusic) {
      if (this.currentMusic.getVolume() > 0) {
        this.currentMusic.setVolume(0);
      } else {
        this.currentMusic.setVolume(this.musicVolume);
      }
    }
  }

  /**
   * Update audio (for day/night music transitions)
   */
  updateForTimeOfDay(hour: number) {
    // Change music based on time of day
    if (hour >= 6 && hour < 18) {
      // Day time - light ambient
      if (!this.currentMusic || !this.currentMusic.isPlaying) {
        this.playMusic('ambient_light');
      }
    } else if (hour >= 18 && hour < 22) {
      // Evening - normal ambient
      if (!this.currentMusic || !this.currentMusic.isPlaying) {
        this.playMusic('ambient_normal');
      }
    } else {
      // Night - night ambient
      if (!this.currentMusic || !this.currentMusic.isPlaying) {
        this.playMusic('ambient_night');
      }
    }
  }

  /**
   * Enter combat mode
   */
  enterCombat() {
    this.playMusic('combat', true);
  }

  /**
   * Exit combat mode
   */
  exitCombat(currentHour: number) {
    this.updateForTimeOfDay(currentHour);
  }

  /**
   * Cleanup
   */
  dispose() {
    this.stopMusic();
    this.soundEffects.clear();
  }
}
