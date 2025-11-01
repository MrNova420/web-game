import * as THREE from 'three';
import { TerrainGenerator } from '../world/TerrainGenerator';
import { ChunkManager } from '../world/ChunkManager';

export class Engine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  private terrainGenerator: TerrainGenerator;
  private chunkManager: ChunkManager;
  private playerPosition: THREE.Vector3;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
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

    // Initialize terrain system
    this.terrainGenerator = new TerrainGenerator();
    this.chunkManager = new ChunkManager(this.terrainGenerator);
    this.playerPosition = new THREE.Vector3(0, 0, 0);

    this.setupLighting();
    // Remove test objects - using real terrain now
  }

  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    this.scene.add(directionalLight);
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
    // Update terrain chunks based on player position
    this.chunkManager.update(this.playerPosition, this.scene);
    
    // Simple camera rotation for testing
    const time = this.clock.getElapsedTime();
    const radius = 50;
    this.camera.position.x = Math.sin(time * 0.1) * radius;
    this.camera.position.z = Math.cos(time * 0.1) * radius;
    this.camera.position.y = 30;
    this.camera.lookAt(0, 0, 0);
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
