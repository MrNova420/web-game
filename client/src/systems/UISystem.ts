/**
 * UI Panel types
 */
export type UIPanel = 'inventory' | 'character' | 'quests' | 'crafting' | 'settings' | 'none';

/**
 * UISystem - Manages game UI overlays
 * Uses HTML/CSS for UI (not 3D models)
 */
export class UISystem {
  private activePanel: UIPanel = 'none';
  private uiContainer: HTMLElement;
  private panels: Map<string, HTMLElement> = new Map();

  constructor() {
    // Create main UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.id = 'game-ui';
    this.uiContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: Arial, sans-serif;
    `;
    document.body.appendChild(this.uiContainer);

    this.createHUD();
    this.createInventoryPanel();
    this.createQuestPanel();
    this.createCharacterPanel();

    console.log('UISystem initialized');
  }

  /**
   * Create HUD (always visible)
   */
  private createHUD() {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      pointer-events: auto;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    `;
    hud.innerHTML = `
      <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 8px;">
        <div><strong>Health:</strong> <span id="health-bar">100/100</span></div>
        <div><strong>Mana:</strong> <span id="mana-bar">50/50</span></div>
        <div><strong>Level:</strong> <span id="level">1</span></div>
        <div><strong>XP:</strong> <span id="xp">0/100</span></div>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; margin-top: 10px;">
        <strong>Controls:</strong><br>
        WASD - Move<br>
        I - Inventory<br>
        C - Character<br>
        Q - Quests<br>
        ESC - Menu
      </div>
    `;
    this.uiContainer.appendChild(hud);
  }

  /**
   * Create inventory panel
   */
  private createInventoryPanel() {
    const panel = document.createElement('div');
    panel.id = 'inventory-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      height: 400px;
      background: rgba(20, 20, 20, 0.95);
      border: 3px solid #8b7355;
      border-radius: 10px;
      padding: 20px;
      display: none;
      pointer-events: auto;
      color: white;
    `;
    panel.innerHTML = `
      <h2 style="margin-top: 0; color: #ffd700;">Inventory</h2>
      <div id="inventory-grid" style="
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
        height: 300px;
        overflow-y: auto;
      ">
        <!-- Inventory slots will be added dynamically -->
      </div>
      <button onclick="document.getElementById('inventory-panel').style.display='none'" 
        style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #8b7355;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        ">Close</button>
    `;
    this.uiContainer.appendChild(panel);
    this.panels.set('inventory', panel);
  }

  /**
   * Create quest panel
   */
  private createQuestPanel() {
    const panel = document.createElement('div');
    panel.id = 'quest-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 400px;
      background: rgba(20, 20, 20, 0.95);
      border: 3px solid #8b7355;
      border-radius: 10px;
      padding: 20px;
      display: none;
      pointer-events: auto;
      color: white;
    `;
    panel.innerHTML = `
      <h2 style="margin-top: 0; color: #ffd700;">Quests</h2>
      <div id="quest-list" style="height: 300px; overflow-y: auto;">
        <div style="padding: 10px; background: rgba(255,255,255,0.1); margin-bottom: 10px; border-radius: 5px;">
          <h3 style="margin: 0;">Gather Wood</h3>
          <p style="margin: 5px 0;">Collect 10 pieces of wood from trees</p>
          <div style="color: #ffd700;">Progress: 0/10</div>
        </div>
        <div style="padding: 10px; background: rgba(255,255,255,0.1); margin-bottom: 10px; border-radius: 5px;">
          <h3 style="margin: 0;">Skeleton Slayer</h3>
          <p style="margin: 5px 0;">Defeat 5 skeleton minions</p>
          <div style="color: #ffd700;">Progress: 0/5</div>
        </div>
      </div>
      <button onclick="document.getElementById('quest-panel').style.display='none'" 
        style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #8b7355;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        ">Close</button>
    `;
    this.uiContainer.appendChild(panel);
    this.panels.set('quests', panel);
  }

  /**
   * Create character panel
   */
  private createCharacterPanel() {
    const panel = document.createElement('div');
    panel.id = 'character-panel';
    panel.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 450px;
      background: rgba(20, 20, 20, 0.95);
      border: 3px solid #8b7355;
      border-radius: 10px;
      padding: 20px;
      display: none;
      pointer-events: auto;
      color: white;
    `;
    panel.innerHTML = `
      <h2 style="margin-top: 0; color: #ffd700;">Character Stats</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <h3>Attributes</h3>
          <div>Strength: <span id="stat-str">10</span></div>
          <div>Dexterity: <span id="stat-dex">10</span></div>
          <div>Intelligence: <span id="stat-int">10</span></div>
          <div>Vitality: <span id="stat-vit">10</span></div>
        </div>
        <div>
          <h3>Combat</h3>
          <div>Attack: <span id="stat-atk">10</span></div>
          <div>Defense: <span id="stat-def">5</span></div>
          <div>Crit Chance: <span id="stat-crit">5%</span></div>
          <div>Crit Damage: <span id="stat-critdmg">150%</span></div>
        </div>
      </div>
      <button onclick="document.getElementById('character-panel').style.display='none'" 
        style="
          position: absolute;
          bottom: 20px;
          right: 20px;
          padding: 10px 20px;
          background: #8b7355;
          border: none;
          border-radius: 5px;
          color: white;
          cursor: pointer;
        ">Close</button>
    `;
    this.uiContainer.appendChild(panel);
    this.panels.set('character', panel);
  }

  /**
   * Toggle UI panel
   */
  togglePanel(panel: UIPanel) {
    // Close all panels
    this.panels.forEach((panelElement) => {
      panelElement.style.display = 'none';
    });

    // Open requested panel
    if (panel !== 'none') {
      const panelElement = this.panels.get(panel);
      if (panelElement) {
        panelElement.style.display = 'block';
        this.activePanel = panel;
      }
    } else {
      this.activePanel = 'none';
    }
  }

  /**
   * Update HUD stats
   */
  updateStats(stats: {
    health?: number;
    maxHealth?: number;
    mana?: number;
    maxMana?: number;
    level?: number;
    experience?: number;
    experienceToNext?: number;
  }) {
    if (stats.health !== undefined && stats.maxHealth !== undefined) {
      const healthBar = document.getElementById('health-bar');
      if (healthBar) healthBar.textContent = `${Math.floor(stats.health)}/${stats.maxHealth}`;
    }

    if (stats.mana !== undefined && stats.maxMana !== undefined) {
      const manaBar = document.getElementById('mana-bar');
      if (manaBar) manaBar.textContent = `${Math.floor(stats.mana)}/${stats.maxMana}`;
    }

    if (stats.level !== undefined) {
      const level = document.getElementById('level');
      if (level) level.textContent = `${stats.level}`;
    }

    if (stats.experience !== undefined && stats.experienceToNext !== undefined) {
      const xp = document.getElementById('xp');
      if (xp) xp.textContent = `${stats.experience}/${stats.experienceToNext}`;
    }
  }

  /**
   * Get active panel
   */
  getActivePanel(): UIPanel {
    return this.activePanel;
  }

  /**
   * Show message
   */
  showMessage(message: string, duration: number = 3000) {
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      pointer-events: none;
      z-index: 2000;
    `;
    messageDiv.textContent = message;
    this.uiContainer.appendChild(messageDiv);

    setTimeout(() => {
      this.uiContainer.removeChild(messageDiv);
    }, duration);
  }

  /**
   * Cleanup
   */
  dispose() {
    document.body.removeChild(this.uiContainer);
  }
}
