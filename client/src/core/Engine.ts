import * as THREE from 'three';
import { TerrainGenerator } from '../world/TerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';
import { SkyboxManager } from '../world/SkyboxManager';
import { VegetationManager } from '../world/VegetationManager';
import { WaterSystem } from '../world/WaterSystem';
import { DayNightCycle } from '../world/DayNightCycle';
import { PlayerController } from './PlayerController';
import { AssetLoader } from '../assets/AssetLoader';

export class Engine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private terrainGenerator: TerrainGenerator;
  private chunkManager: ChunkManager;
  private skyboxManager: SkyboxManager;
  private vegetationManager: VegetationManager;
  private waterSystem: WaterSystem;
  private dayNightCycle: DayNightCycle;
  private playerController: PlayerController;
  private assetLoader: AssetLoader;
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

    // Initialize asset loader
    this.assetLoader = new AssetLoader();

    // Initialize terrain system
    this.terrainGenerator = new TerrainGenerator();
    this.chunkManager = new ChunkManager(this.terrainGenerator);
    this.playerPosition = new THREE.Vector3(0, 0, 0);

    // Initialize water system
    this.waterSystem = new WaterSystem(this.scene);
    this.chunkManager.setWaterSystem(this.waterSystem);

    // Initialize vegetation manager
    this.vegetationManager = new VegetationManager(this.assetLoader, this.terrainGenerator);
    this.chunkManager.setVegetationManager(this.vegetationManager);

    // Initialize skybox
    this.skyboxManager = new SkyboxManager(this.scene);
    this.skyboxManager.loadSkybox('day'); // Load default day skybox

    this.setupLighting();

    // Initialize day/night cycle after lighting
    this.dayNightCycle = new DayNightCycle(
      this.directionalLight,
      this.ambientLight,
      this.skyboxManager
    );

    // Initialize player controller
    this.playerController = new PlayerController(this.camera, new THREE.Vector3(0, 20, 0));
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

    // Update terrain chunks based on player position
    this.chunkManager.update(this.playerPosition, this.scene);
    
    // Update water animation
    this.waterSystem.update(deltaTime);
    
    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public getScene() {
    return this.scene;
  }

  public getCamera() {
    return this.camera;
  }
}
