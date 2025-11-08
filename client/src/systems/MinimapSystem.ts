import * as THREE from 'three';

/**
 * MinimapSystem - Renders a 2D minimap overlay
 * Shows player position, NPCs, enemies, and points of interest
 */
export class MinimapSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mapSize = 200; // pixels
  private worldScale = 0.5; // pixels per world unit
  private playerColor = '#00ff00';
  private enemyColor = '#ff0000';
  private npcColor = '#ffff00';
  private resourceColor = '#8b4513';
  private dungeonColor = '#800080';

  constructor() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minimap';
    this.canvas.width = this.mapSize;
    this.canvas.height = this.mapSize;
    this.canvas.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: ${this.mapSize}px;
      height: ${this.mapSize}px;
      border: 3px solid #8b7355;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    console.log('MinimapSystem initialized');
  }

  /**
   * Update and render minimap - called by IntegrationManager with deltaTime
   */
  update(_deltaTime?: number) {
    // For now just render a simple minimap without entity data
    // Will be enhanced later when entity systems provide data
    
    // Clear canvas
    this.ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    this.ctx.fillRect(0, 0, this.mapSize, this.mapSize);

    // Draw grid
    this.drawGrid();

    // Center map on player
    const centerX = this.mapSize / 2;
    const centerY = this.mapSize / 2;

    // Draw player (always at center)
    this.ctx.fillStyle = this.playerColor;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw player direction indicator
    this.ctx.strokeStyle = this.playerColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX, centerY - 10);
    this.ctx.stroke();

    // Draw compass
    this.drawCompass();
  }
  
  /**
   * Update with full entity data - called manually when needed
   */
  updateWithEntities(
    playerPos: THREE.Vector3,
    entities: {
      enemies?: Array<{ position: THREE.Vector3 }>;
      npcs?: Array<{ position: THREE.Vector3 }>;
      resources?: Array<{ position: THREE.Vector3 }>;
      dungeons?: Array<{ position: THREE.Vector3 }>;
    }
  ) {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    this.ctx.fillRect(0, 0, this.mapSize, this.mapSize);

    // Draw grid
    this.drawGrid();

    // Center map on player
    const centerX = this.mapSize / 2;
    const centerY = this.mapSize / 2;

    // Draw entities relative to player
    if (entities.resources) {
      this.drawEntities(entities.resources, playerPos, this.resourceColor, 2);
    }

    if (entities.dungeons) {
      this.drawEntities(entities.dungeons, playerPos, this.dungeonColor, 4);
    }

    if (entities.npcs) {
      this.drawEntities(entities.npcs, playerPos, this.npcColor, 3);
    }

    if (entities.enemies) {
      this.drawEntities(entities.enemies, playerPos, this.enemyColor, 3);
    }

    // Draw player (always at center)
    this.ctx.fillStyle = this.playerColor;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw player direction indicator
    this.ctx.strokeStyle = this.playerColor;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(centerX, centerY - 10);
    this.ctx.stroke();

    // Draw compass
    this.drawCompass();
  }

  /**
   * Draw grid lines
   */
  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSize = 40;
    for (let x = 0; x < this.mapSize; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.mapSize);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.mapSize; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.mapSize, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw entities on minimap
   */
  private drawEntities(
    entities: Array<{ position: THREE.Vector3 }>,
    playerPos: THREE.Vector3,
    color: string,
    size: number
  ) {
    const centerX = this.mapSize / 2;
    const centerY = this.mapSize / 2;
    const maxDistance = this.mapSize / (2 * this.worldScale);

    this.ctx.fillStyle = color;

    entities.forEach(entity => {
      const dx = entity.position.x - playerPos.x;
      const dz = entity.position.z - playerPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Only draw if within range
      if (distance < maxDistance) {
        const x = centerX + dx * this.worldScale;
        const y = centerY + dz * this.worldScale;

        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  /**
   * Draw compass directions
   */
  private drawCompass() {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.font = '12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // North
    this.ctx.fillText('N', this.mapSize / 2, 15);
    // South
    this.ctx.fillText('S', this.mapSize / 2, this.mapSize - 15);
    // East
    this.ctx.fillText('E', this.mapSize - 15, this.mapSize / 2);
    // West
    this.ctx.fillText('W', 15, this.mapSize / 2);
  }

  /**
   * Set map zoom
   */
  setZoom(scale: number) {
    this.worldScale = scale;
  }

  /**
   * Toggle minimap visibility
   */
  toggle() {
    this.canvas.style.display = this.canvas.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Show minimap
   */
  show() {
    this.canvas.style.display = 'block';
  }

  /**
   * Hide minimap
   */
  hide() {
    this.canvas.style.display = 'none';
  }

  /**
   * Cleanup
   */
  dispose() {
    document.body.removeChild(this.canvas);
  }
}
