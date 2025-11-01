import { describe, it, expect, beforeEach } from 'vitest';
import { AudioSystem } from '../systems/AudioSystem';

describe('AudioSystem', () => {
  let audioSystem: AudioSystem;

  beforeEach(() => {
    audioSystem = new AudioSystem();
  });

  it('should create an audio system', () => {
    expect(audioSystem).toBeDefined();
  });

  it('should load audio files', () => {
    const loaded = audioSystem.loadSound('bg_music', 'path/to/music.mp3');
    expect(typeof loaded).toBe('boolean');
  });

  it('should play sounds', () => {
    audioSystem.loadSound('footstep', 'path/to/footstep.mp3');
    audioSystem.playSound('footstep');
    expect(audioSystem.isPlaying('footstep')).toBe(true);
  });

  it('should control volume', () => {
    audioSystem.setMasterVolume(0.5);
    const volume = audioSystem.getMasterVolume();
    expect(volume).toBe(0.5);
  });

  it('should mute/unmute', () => {
    audioSystem.setMute(true);
    expect(audioSystem.isMuted()).toBe(true);
    audioSystem.setMute(false);
    expect(audioSystem.isMuted()).toBe(false);
  });

  it('should play 3D positional audio', () => {
    audioSystem.loadSound('ambient', 'path/to/ambient.mp3');
    audioSystem.play3DSound('ambient', 10, 0, 10);
    expect(audioSystem.isPlaying('ambient')).toBe(true);
  });

  it('should stop all sounds', () => {
    audioSystem.playSound('sound1');
    audioSystem.playSound('sound2');
    audioSystem.stopAll();
    expect(audioSystem.isPlaying('sound1')).toBe(false);
  });
});
