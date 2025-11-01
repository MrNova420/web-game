import * as THREE from 'three';
import { AssetLoader } from '../assets/AssetLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

/**
 * CharacterSystem - Manages player and NPC characters using ONLY real character models
 * Uses Universal_Base_Characters FBX models
 */
export class CharacterSystem {
  private assetLoader: AssetLoader;
  private fbxLoader: FBXLoader;
  private characters = new Map<string, THREE.Group>();
  
  // Character model paths from your assets
  private characterModels = {
    player: {
      male: '/extracted_assets/Universal_Base_Characters/Base Characters/Unity/Superhero_Male.fbx',
      female: '/extracted_assets/Universal_Base_Characters/Base Characters/Unity/Superhero_Female.fbx'
    },
    hairstyles: {
      long: '/extracted_assets/Universal_Base_Characters/Hairstyles/Origin at Head Bone/FBX (Unity)/Hair_Long_HO.fbx',
      buns: '/extracted_assets/Universal_Base_Characters/Hairstyles/Origin at Head Bone/FBX (Unity)/Hair_Buns_HO.fbx',
      buzzed: '/extracted_assets/Universal_Base_Characters/Hairstyles/Origin at Head Bone/FBX (Unity)/Hair_Buzzed_HO.fbx',
      parted: '/extracted_assets/Universal_Base_Characters/Hairstyles/Origin at Head Bone/FBX (Unity)/Hair_SimpleParted_HO.fbx',
    }
  };

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
    this.fbxLoader = new FBXLoader();
  }

  /**
   * Create a player character using real character model
   */
  async createPlayer(
    id: string,
    position: THREE.Vector3,
    gender: 'male' | 'female',
    scene: THREE.Scene
  ): Promise<THREE.Group> {
    try {
      // Load character model
      const modelPath = this.characterModels.player[gender];
      const character = await this.fbxLoader.loadAsync(modelPath);
      
      // Position and scale character
      character.position.copy(position);
      character.scale.set(0.01, 0.01, 0.01); // FBX models are usually large
      
      // Add to scene
      scene.add(character);
      this.characters.set(id, character);
      
      console.log(`Created ${gender} player character at`, position);
      return character;
      
    } catch (error) {
      console.error('Failed to load character model:', error);
      throw error;
    }
  }

  /**
   * Update character position
   */
  updateCharacterPosition(id: string, position: THREE.Vector3) {
    const character = this.characters.get(id);
    if (character) {
      character.position.copy(position);
    }
  }

  /**
   * Get character by ID
   */
  getCharacter(id: string): THREE.Group | undefined {
    return this.characters.get(id);
  }
}
