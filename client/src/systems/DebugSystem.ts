import * as THREE from 'three';

/**
 * DebugSystem - Developer console and debugging tools
 * Provides commands, entity inspection, and visualization tools
 */
export class DebugSystem {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private consoleElement: HTMLDivElement | null = null;
  private inputElement: HTMLInputElement | null = null;
  private outputElement: HTMLDivElement | null = null;
  private isVisible: boolean = false;
  
  private commandHistory: string[] = [];
  private historyIndex: number = -1;
  
  // Debug visualization
  private wireframeMode: boolean = false;
  private showCollisionBoxes: boolean = false;
  private noclipMode: boolean = false;
  
  // FPS graph
  private fpsHistory: number[] = [];
  private maxFPSHistory: number = 60;
  
  // Selected entity for inspection
  private selectedEntity: THREE.Object3D | null = null;
  
  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    this.scene = scene;
    this.camera = camera;
    
    this.createConsoleUI();
    this.setupKeyboardListeners();
  }
  
  private createConsoleUI(): void {
    // Create console container
    this.consoleElement = document.createElement('div');
    this.consoleElement.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 300px;
      background: rgba(0, 0, 0, 0.9);
      border: 2px solid #00ff00;
      border-radius: 5px;
      display: none;
      flex-direction: column;
      font-family: 'Courier New', monospace;
      color: #00ff00;
      z-index: 1000;
    `;
    
    // Output area
    this.outputElement = document.createElement('div');
    this.outputElement.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      font-size: 12px;
    `;
    
    // Input area
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'text';
    this.inputElement.placeholder = 'Enter command...';
    this.inputElement.style.cssText = `
      width: 100%;
      padding: 10px;
      background: rgba(0, 0, 0, 0.8);
      border: none;
      border-top: 1px solid #00ff00;
      color: #00ff00;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      outline: none;
    `;
    
    this.consoleElement.appendChild(this.outputElement);
    this.consoleElement.appendChild(this.inputElement);
    document.body.appendChild(this.consoleElement);
    
    // Input event listener
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.executeCommand(this.inputElement!.value);
        this.inputElement!.value = '';
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.navigateHistory(1);
      }
    });
    
    this.log('Debug Console Ready. Press F1 to toggle. Type "help" for commands.');
  }
  
  private setupKeyboardListeners(): void {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  /**
   * Toggle console visibility
   */
  public toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.consoleElement) {
      this.consoleElement.style.display = this.isVisible ? 'flex' : 'none';
      if (this.isVisible && this.inputElement) {
        this.inputElement.focus();
      }
    }
  }
  
  /**
   * Log message to console
   */
  public log(message: string, type: 'info' | 'error' | 'success' = 'info'): void {
    if (!this.outputElement) return;
    
    const line = document.createElement('div');
    line.textContent = `> ${message}`;
    
    switch (type) {
      case 'error':
        line.style.color = '#ff0000';
        break;
      case 'success':
        line.style.color = '#00ff00';
        break;
      default:
        line.style.color = '#ffffff';
    }
    
    this.outputElement.appendChild(line);
    this.outputElement.scrollTop = this.outputElement.scrollHeight;
  }
  
  /**
   * Execute console command
   */
  private executeCommand(command: string): void {
    if (!command.trim()) return;
    
    this.commandHistory.push(command);
    this.historyIndex = this.commandHistory.length;
    
    this.log(command, 'info');
    
    const parts = command.toLowerCase().split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'help':
        this.showHelp();
        break;
      case 'spawn':
        this.spawnEntity(args[0], args.slice(1));
        break;
      case 'teleport':
      case 'tp':
        this.teleportPlayer(args);
        break;
      case 'give':
        this.giveItem(args[0], parseInt(args[1]) || 1);
        break;
      case 'settime':
        this.setTime(parseFloat(args[0]));
        break;
      case 'weather':
        this.setWeather(args[0]);
        break;
      case 'noclip':
        this.toggleNoclip();
        break;
      case 'wireframe':
        this.toggleWireframe();
        break;
      case 'collision':
        this.toggleCollisionBoxes();
        break;
      case 'fps':
        this.toggleFPS(args[0]);
        break;
      case 'clear':
        if (this.outputElement) this.outputElement.innerHTML = '';
        break;
      default:
        this.log(`Unknown command: ${cmd}. Type "help" for commands.`, 'error');
    }
  }
  
  private showHelp(): void {
    const commands = [
      'help - Show this help',
      'spawn [type] - Spawn entity (enemy, npc, resource)',
      'teleport [x] [y] [z] - Teleport player',
      'give [item] [amount] - Give item to player',
      'settime [hour] - Set time of day (0-24)',
      'weather [type] - Set weather (clear, rain, snow, fog)',
      'noclip - Toggle no-clip mode',
      'wireframe - Toggle wireframe rendering',
      'collision - Toggle collision box visualization',
      'fps [on/off] - Toggle FPS display',
      'clear - Clear console'
    ];
    
    commands.forEach(cmd => this.log(cmd));
  }
  
  private spawnEntity(type: string, args: string[]): void {
    this.log(`Spawning ${type}...`, 'success');
    // Would dispatch event to spawn entity
    // window.dispatchEvent(new CustomEvent('debug:spawn', { detail: { type, args } }));
  }
  
  private teleportPlayer(coords: string[]): void {
    if (coords.length < 3) {
      this.log('Usage: teleport [x] [y] [z]', 'error');
      return;
    }
    
    const x = parseFloat(coords[0]);
    const y = parseFloat(coords[1]);
    const z = parseFloat(coords[2]);
    
    this.log(`Teleporting to ${x}, ${y}, ${z}`, 'success');
    // Would dispatch event to move player
    // window.dispatchEvent(new CustomEvent('debug:teleport', { detail: { x, y, z } }));
  }
  
  private giveItem(item: string, amount: number): void {
    this.log(`Giving ${amount}x ${item}`, 'success');
    // Would dispatch event to give item
    // window.dispatchEvent(new CustomEvent('debug:give', { detail: { item, amount } }));
  }
  
  private setTime(hour: number): void {
    if (hour < 0 || hour > 24) {
      this.log('Time must be between 0 and 24', 'error');
      return;
    }
    this.log(`Setting time to ${hour}:00`, 'success');
    // Would dispatch event to change time
    // window.dispatchEvent(new CustomEvent('debug:settime', { detail: { hour } }));
  }
  
  private setWeather(type: string): void {
    this.log(`Setting weather to ${type}`, 'success');
    // Would dispatch event to change weather
    // window.dispatchEvent(new CustomEvent('debug:weather', { detail: { type } }));
  }
  
  private toggleNoclip(): void {
    this.noclipMode = !this.noclipMode;
    this.log(`Noclip ${this.noclipMode ? 'enabled' : 'disabled'}`, 'success');
    // Would dispatch event
    // window.dispatchEvent(new CustomEvent('debug:noclip', { detail: { enabled: this.noclipMode } }));
  }
  
  private toggleWireframe(): void {
    this.wireframeMode = !this.wireframeMode;
    
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.wireframe = this.wireframeMode);
        } else {
          obj.material.wireframe = this.wireframeMode;
        }
      }
    });
    
    this.log(`Wireframe ${this.wireframeMode ? 'enabled' : 'disabled'}`, 'success');
  }
  
  private toggleCollisionBoxes(): void {
    this.showCollisionBoxes = !this.showCollisionBoxes;
    this.log(`Collision boxes ${this.showCollisionBoxes ? 'enabled' : 'disabled'}`, 'success');
  }
  
  private toggleFPS(state: string): void {
    const enabled = state === 'on';
    this.log(`FPS display ${enabled ? 'enabled' : 'disabled'}`, 'success');
    // Would dispatch event
    // window.dispatchEvent(new CustomEvent('debug:fps', { detail: { enabled } }));
  }
  
  private navigateHistory(direction: number): void {
    this.historyIndex = Math.max(0, Math.min(this.commandHistory.length, this.historyIndex + direction));
    
    if (this.inputElement && this.historyIndex < this.commandHistory.length) {
      this.inputElement.value = this.commandHistory[this.historyIndex];
    } else if (this.inputElement) {
      this.inputElement.value = '';
    }
  }
  
  /**
   * Track FPS for graph
   */
  public recordFPS(fps: number): void {
    this.fpsHistory.push(fps);
    if (this.fpsHistory.length > this.maxFPSHistory) {
      this.fpsHistory.shift();
    }
  }
  
  /**
   * Get FPS history for graphing
   */
  public getFPSHistory(): number[] {
    return [...this.fpsHistory];
  }
  
  /**
   * Select entity for inspection
   */
  public selectEntity(entity: THREE.Object3D): void {
    this.selectedEntity = entity;
    this.log(`Selected: ${entity.name || 'Unnamed'} (${entity.type})`);
  }
  
  /**
   * Get selected entity info
   */
  public getSelectedInfo(): string {
    if (!this.selectedEntity) return 'No entity selected';
    
    const pos = this.selectedEntity.position;
    const rot = this.selectedEntity.rotation;
    const scale = this.selectedEntity.scale;
    
    return `
      Name: ${this.selectedEntity.name || 'Unnamed'}
      Type: ${this.selectedEntity.type}
      Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})
      Rotation: (${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)})
      Scale: (${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})
      Visible: ${this.selectedEntity.visible}
      Children: ${this.selectedEntity.children.length}
    `.trim();
  }
  
  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.consoleElement) {
      document.body.removeChild(this.consoleElement);
    }
  }
}
