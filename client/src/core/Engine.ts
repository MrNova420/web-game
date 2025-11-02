import * as THREE from 'three';
import { RealAssetTerrainGenerator } from '../world/RealAssetTerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';
import { SkyboxManager } from '../world/SkyboxManager';
import { VegetationManager } from '../world/VegetationManager';
import { DayNightCycle } from '../world/DayNightCycle';
import { PlayerController } from './PlayerController';
import { AssetLoader } from '../assets/AssetLoader';
import { GrassSystem } from '../world/GrassSystem';
import { WeatherSystem } from '../world/WeatherSystem';
import { WindSystem } from '../world/WindSystem';
import { PostProcessingManager } from './PostProcessingManager';

/**
 * Engine - Main game engine using ONLY real asset models
 * NO procedural geometry for visible objects
 */
export class Engine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private terrainGenerator: RealAssetTerrainGenerator;
  private chunkManager: ChunkManager;
  private skyboxManager: SkyboxManager;
  private vegetationManager: VegetationManager;
  private dayNightCycle: DayNightCycle;
  private playerController: PlayerController;
  private assetLoader: AssetLoader;
  private grassSystem: GrassSystem;
  private weatherSystem: WeatherSystem;
  private windSystem: WindSystem;
  private postProcessing: PostProcessingManager;
  private playerPosition: THREE.Vector3;
  private directionalLight!: THREE.DirectionalLight;
  private ambientLight!: THREE.AmbientLight;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    // Background will be replaced by skybox
    this.scene.background = new THREE.Color(0x87ceeb);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 20, 30);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.clock = new THREE.Clock();

    window.addEventListener('resize', () => this.onResize());

    // Initialize asset loader FIRST
    this.assetLoader = new AssetLoader();

    // Initialize REAL asset-based terrain system - uses actual tile models
    this.terrainGenerator = new RealAssetTerrainGenerator(this.assetLoader);
    this.chunkManager = new ChunkManager(this.terrainGenerator);
    this.chunkManager.setScene(this.scene); // Set scene reference
    this.playerPosition = new THREE.Vector3(0, 0, 0);

    // Initialize vegetation manager - uses actual tree/bush/rock models
    this.vegetationManager = new VegetationManager(this.assetLoader, this.terrainGenerator);
    this.chunkManager.setVegetationManager(this.vegetationManager);

    // Initialize grass system - uses actual grass models
    this.grassSystem = new GrassSystem(this.terrainGenerator, this.assetLoader);
    this.chunkManager.setGrassSystem(this.grassSystem);

    // Initialize skybox - uses actual skybox textures
    this.skyboxManager = new SkyboxManager(this.scene);
    this.skyboxManager.loadSkybox('day');

    this.setupLighting();

    // Initialize day/night cycle after lighting
    this.dayNightCycle = new DayNightCycle(
      this.directionalLight,
      this.ambientLight,
      this.skyboxManager
    );

    // Initialize player controller
    this.playerController = new PlayerController(this.camera, new THREE.Vector3(0, 20, 0));

    // Initialize wind system
    this.windSystem = new WindSystem();

    // Initialize weather system (uses particles - acceptable)
    this.weatherSystem = new WeatherSystem(this.scene);
    this.weatherSystem.setWeather('clear');

    // Initialize post-processing (shaders - acceptable)
    this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);
  }

  private setupLighting() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.directionalLight.position.set(5, 10, 5);
    this.scene.add(this.directionalLight);
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.postProcessing.setSize(window.innerWidth, window.innerHeight);
  }

  public start() {
    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  };

  private update(deltaTime: number) {
    // Get terrain height at player position
    const terrainHeight = this.terrainGenerator.getHeight(
      this.playerController.getPosition().x,
      this.playerController.getPosition().z
    );

    // Update player controller
    this.playerController.update(deltaTime, terrainHeight);
    
    // Update player position from controller
    this.playerPosition = this.playerController.getPosition();

    // Update player position in chunk manager
    this.chunkManager.setPlayerPosition(this.playerPosition);
    
    // Update terrain chunks based on player position
    this.chunkManager.update(deltaTime);
    
    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);
    
    // Update wind system
    this.windSystem.update(deltaTime);
    
    // Update grass with wind
    this.grassSystem.update(
      deltaTime, 
      this.windSystem.getWindDirection(), 
      this.windSystem.getWindStrength()
    );
    
    // Update weather system
    this.weatherSystem.update(deltaTime, this.playerPosition);
  }

  private render() {
    // Use post-processing for enhanced visuals
    this.postProcessing.render();
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }
}
