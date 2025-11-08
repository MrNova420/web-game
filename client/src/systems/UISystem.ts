/**
 * UISystem - Complete game UI matching the fantasy start menu theme
 * Comprehensive HUD, panels, and overlays with blue gradient aesthetic
 */

import { UITheme } from '../ui/UITheme';

export type UIPanel = 'inventory' | 'character' | 'quests' | 'crafting' | 'building' | 'settings' | 'map' | 'none';

export class UISystem {
  private activePanel: UIPanel = 'none';
  private uiContainer: HTMLElement;
  private panels: Map<string, HTMLElement> = new Map();
  private hudElements: Map<string, HTMLElement> = new Map();

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
      font-family: ${UITheme.FONT_BODY};
    `;
    document.body.appendChild(this.uiContainer);

    this.createModernHUD();
    this.createInventoryPanel();
    this.createCraftingPanel();
    this.createBuildingPanel();
    this.createQuestPanel();
    this.createCharacterPanel();
    this.createMapPanel();
    this.createSettingsPanel();
    this.createQuickbar();

    console.log('UISystem initialized with fantasy theme');
  }

  /**
   * Create modern HUD matching menu theme
   */
  private createModernHUD() {
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;

    // Top-left: Player stats
    const statsPanel = document.createElement('div');
    statsPanel.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      pointer-events: auto;
      background: ${UITheme.PRIMARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 10px;
      padding: 20px;
      min-width: 280px;
      box-shadow: ${UITheme.SHADOW};
    `;
    
    statsPanel.innerHTML = `
      <div style="margin-bottom: 15px;">
        <div style="color: ${UITheme.TEXT_GOLD}; font-weight: bold; margin-bottom: 8px; font-size: 16px;">🎮 ${UITheme.TEXT_PRIMARY} Fantasy Survival MMO</div>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: ${UITheme.TEXT_SECONDARY};">❤️ Health</span>
            <span id="health-text" style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">100/100</span>
          </div>
          <div id="health-bar-container"></div>
        </div>
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span style="color: ${UITheme.TEXT_SECONDARY};">💧 Mana</span>
            <span id="mana-text" style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">50/50</span>
          </div>
          <div id="mana-bar-container"></div>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid ${UITheme.BORDER_COLOR};">
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY}; font-size: 12px;">Level</div>
            <div id="level" style="color: ${UITheme.TEXT_GOLD}; font-weight: bold; font-size: 18px;">1</div>
          </div>
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY}; font-size: 12px;">XP</div>
            <div id="xp" style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold; font-size: 14px;">0/100</div>
          </div>
        </div>
      </div>
    `;

    // Add progress bars
    const healthBarContainer = statsPanel.querySelector('#health-bar-container');
    if (healthBarContainer) {
      healthBarContainer.appendChild(UITheme.createProgressBar(100, 100, '#ff0000'));
    }

    const manaBarContainer = statsPanel.querySelector('#mana-bar-container');
    if (manaBarContainer) {
      manaBarContainer.appendChild(UITheme.createProgressBar(50, 50, '#0099ff'));
    }

    hud.appendChild(statsPanel);
    this.hudElements.set('stats', statsPanel);

    // Top-right: Minimap placeholder
    const minimapPanel = document.createElement('div');
    minimapPanel.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      width: 200px;
      height: 200px;
      pointer-events: auto;
      background: ${UITheme.PRIMARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 10px;
      padding: 10px;
      box-shadow: ${UITheme.SHADOW};
    `;
    minimapPanel.innerHTML = `
      <div style="color: ${UITheme.TEXT_GOLD}; font-weight: bold; text-align: center; margin-bottom: 10px;">MINIMAP</div>
      <div style="width: 100%; height: 160px; background: rgba(0,50,100,0.3); border: 1px solid ${UITheme.BORDER_COLOR}; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: ${UITheme.TEXT_SECONDARY};">
        <div style="text-align: center;">
          <div style="font-size: 40px;">📍</div>
          <div style="font-size: 12px; margin-top: 5px;">Your Location</div>
        </div>
      </div>
    `;
    hud.appendChild(minimapPanel);
    this.hudElements.set('minimap', minimapPanel);

    // Bottom-left: Controls help
    const controlsPanel = document.createElement('div');
    controlsPanel.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      pointer-events: auto;
      background: ${UITheme.PRIMARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 10px;
      padding: 15px;
      box-shadow: ${UITheme.SHADOW};
    `;
    controlsPanel.innerHTML = `
      <div style="color: ${UITheme.TEXT_GOLD}; font-weight: bold; margin-bottom: 10px;">⌨️ CONTROLS</div>
      <div style="font-size: 13px; line-height: 1.6;">
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">WASD</span> - Move</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">MOUSE</span> - Look Around</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">I</span> - Inventory</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">C</span> - Character</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">Q</span> - Quests</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">K</span> - Crafting</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">B</span> - Building</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">M</span> - Map</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};"><span style="color: ${UITheme.BORDER_GLOW}; font-weight: bold;">ESC</span> - Menu</div>
      </div>
    `;
    hud.appendChild(controlsPanel);
    this.hudElements.set('controls', controlsPanel);

    // Top-center: FPS counter
    const fpsCounter = document.createElement('div');
    fpsCounter.id = 'fps-counter';
    fpsCounter.style.cssText = `
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: ${UITheme.PRIMARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 8px;
      padding: 8px 20px;
      color: ${UITheme.TEXT_PRIMARY};
      font-weight: bold;
      box-shadow: ${UITheme.SHADOW};
      pointer-events: auto;
    `;
    fpsCounter.innerHTML = `<span style="color: ${UITheme.BORDER_GLOW};">FPS:</span> <span id="fps-value">60</span>`;
    hud.appendChild(fpsCounter);
    this.hudElements.set('fps', fpsCounter);

    this.uiContainer.appendChild(hud);
  }

  /**
   * Create quickbar (bottom center)
   */
  private createQuickbar() {
    const quickbar = document.createElement('div');
    quickbar.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
      pointer-events: auto;
    `;

    // Create 10 slots
    for (let i = 0; i < 10; i++) {
      const slot = UITheme.createItemSlot();
      slot.innerHTML = `<div style="position: absolute; top: 5px; left: 5px; background: rgba(0,0,0,0.7); color: ${UITheme.TEXT_GOLD}; padding: 2px 6px; border-radius: 3px; font-size: 12px; font-weight: bold;">${(i + 1) % 10}</div>`;
      quickbar.appendChild(slot);
    }

    this.uiContainer.appendChild(quickbar);
    this.hudElements.set('quickbar', quickbar);
  }

  /**
   * Create inventory panel with grid layout
   */
  private createInventoryPanel() {
    const panel = UITheme.createPanel('🎒 INVENTORY', '700px', '600px');
    panel.id = 'inventory-panel';
    
    const content = document.createElement('div');
    content.style.cssText = `
      display: flex;
      flex-direction: column;
      height: calc(100% - 80px);
    `;

    // Inventory grid
    const grid = document.createElement('div');
    grid.id = 'inventory-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 10px;
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    `;

    // Create 40 slots
    for (let i = 0; i < 40; i++) {
      const slot = UITheme.createItemSlot();
      grid.appendChild(slot);
    }

    content.appendChild(grid);

    // Bottom info
    const info = document.createElement('div');
    info.style.cssText = `
      margin-top: 15px;
      padding-top: 15px;
      border-top: 2px solid ${UITheme.BORDER_COLOR};
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    info.innerHTML = `
      <div style="color: ${UITheme.TEXT_SECONDARY};">
        <span style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">Weight:</span> 50/200 kg
      </div>
      <div style="color: ${UITheme.TEXT_SECONDARY};">
        <span style="color: ${UITheme.TEXT_GOLD}; font-weight: bold;">💰 Gold:</span> 1,250
      </div>
    `;
    content.appendChild(info);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    content.appendChild(closeBtn);

    panel.appendChild(content);
    this.uiContainer.appendChild(panel);
    this.panels.set('inventory', panel);
  }

  /**
   * Create crafting panel
   */
  private createCraftingPanel() {
    const panel = UITheme.createPanel('🔨 CRAFTING', '800px', '600px');
    panel.id = 'crafting-panel';

    const content = document.createElement('div');
    content.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr; gap: 20px; height: calc(100% - 80px);';

    // Left: Recipe list
    const recipeList = document.createElement('div');
    recipeList.style.cssText = `
      background: ${UITheme.SECONDARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 8px;
      padding: 15px;
      overflow-y: auto;
    `;
    recipeList.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: ${UITheme.TEXT_GOLD};">📜 Recipes</h3>
      ${this.createCraftingRecipes()}
    `;
    content.appendChild(recipeList);

    // Right: Crafting station
    const station = document.createElement('div');
    station.style.cssText = `
      background: ${UITheme.SECONDARY_BG};
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 8px;
      padding: 15px;
      display: flex;
      flex-direction: column;
    `;
    station.innerHTML = `
      <h3 style="margin: 0 0 15px 0; color: ${UITheme.TEXT_GOLD};">🛠️ Craft</h3>
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="text-align: center; padding: 30px; color: ${UITheme.TEXT_SECONDARY};">
            Select a recipe to craft
          </div>
        </div>
        ${UITheme.createButton('CRAFT ITEM', () => UITheme.showNotification('Item crafted!', 2000, 'success')).outerHTML}
      </div>
    `;
    content.appendChild(station);

    panel.appendChild(content);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    panel.appendChild(closeBtn);

    this.uiContainer.appendChild(panel);
    this.panels.set('crafting', panel);
  }

  private createCraftingRecipes(): string {
    const recipes = [
      { name: 'Wooden Pickaxe', materials: 'Wood x5, Stone x3', icon: '⛏️' },
      { name: 'Iron Sword', materials: 'Iron x8, Wood x2', icon: '⚔️' },
      { name: 'Health Potion', materials: 'Herbs x3, Water x1', icon: '🧪' },
      { name: 'Wooden Wall', materials: 'Wood x10', icon: '🪵' },
      { name: 'Torch', materials: 'Wood x2, Coal x1', icon: '🔥' },
    ];

    return recipes.map(r => `
      <div style="background: rgba(0,0,0,0.3); padding: 12px; margin-bottom: 10px; border-radius: 6px; border: 2px solid transparent; cursor: pointer; transition: all 0.3s;" 
           onmouseenter="this.style.borderColor='${UITheme.BORDER_GLOW}'; this.style.background='rgba(0,100,150,0.2)';"
           onmouseleave="this.style.borderColor='transparent'; this.style.background='rgba(0,0,0,0.3)';">
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="font-size: 24px;">${r.icon}</div>
          <div style="flex: 1;">
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">${r.name}</div>
            <div style="color: ${UITheme.TEXT_SECONDARY}; font-size: 12px;">${r.materials}</div>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Create building panel
   */
  private createBuildingPanel() {
    const panel = UITheme.createPanel('🏗️ BUILDING', '750px', '600px');
    panel.id = 'building-panel';

    const content = document.createElement('div');
    content.style.cssText = 'height: calc(100% - 80px);';

    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      height: 100%;
      overflow-y: auto;
      padding: 10px;
    `;

    const buildings = [
      { name: 'Wooden Wall', cost: 'Wood x10', icon: '🪵' },
      { name: 'Stone Wall', cost: 'Stone x15', icon: '🧱' },
      { name: 'Door', cost: 'Wood x8', icon: '🚪' },
      { name: 'Window', cost: 'Wood x5, Glass x2', icon: '🪟' },
      { name: 'Floor', cost: 'Wood x6', icon: '📐' },
      { name: 'Ceiling', cost: 'Wood x8', icon: '⬜' },
      { name: 'Stairs', cost: 'Wood x12', icon: '🪜' },
      { name: 'Foundation', cost: 'Stone x20', icon: '⬛' },
      { name: 'Pillar', cost: 'Stone x10', icon: '🏛️' },
      { name: 'Roof', cost: 'Wood x15', icon: '🔺' },
      { name: 'Fence', cost: 'Wood x4', icon: '🚧' },
      { name: 'Gate', cost: 'Wood x10, Iron x4', icon: '🚧' },
    ];

    buildings.forEach(b => {
      const buildingCard = document.createElement('div');
      buildingCard.style.cssText = `
        background: ${UITheme.SECONDARY_BG};
        border: 2px solid ${UITheme.BORDER_COLOR};
        border-radius: 8px;
        padding: 15px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
      `;
      buildingCard.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">${b.icon}</div>
        <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold; margin-bottom: 5px;">${b.name}</div>
        <div style="color: ${UITheme.TEXT_SECONDARY}; font-size: 12px;">${b.cost}</div>
      `;
      buildingCard.addEventListener('mouseenter', () => {
        buildingCard.style.borderColor = UITheme.BORDER_GLOW;
        buildingCard.style.transform = 'translateY(-5px)';
        buildingCard.style.boxShadow = `0 0 20px rgba(0, 255, 255, 0.4)`;
      });
      buildingCard.addEventListener('mouseleave', () => {
        buildingCard.style.borderColor = UITheme.BORDER_COLOR;
        buildingCard.style.transform = 'translateY(0)';
        buildingCard.style.boxShadow = 'none';
      });
      grid.appendChild(buildingCard);
    });

    content.appendChild(grid);
    panel.appendChild(content);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    panel.appendChild(closeBtn);

    this.uiContainer.appendChild(panel);
    this.panels.set('building', panel);
  }

  /**
   * Create quest panel
   */
  private createQuestPanel() {
    const panel = UITheme.createPanel('📜 QUEST LOG', '700px', '600px');
    panel.id = 'quest-panel';

    const content = document.createElement('div');
    content.style.cssText = 'height: calc(100% - 80px); overflow-y: auto;';

    // Active quests
    const activeSection = document.createElement('div');
    activeSection.innerHTML = `
      <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">⚔️ Active Quests</h3>
    `;

    const quests = [
      { 
        title: 'Gather Wood', 
        desc: 'Collect 10 pieces of wood from trees',
        progress: 3,
        max: 10,
        reward: '50 XP, 25 Gold',
        icon: '🌲'
      },
      { 
        title: 'Skeleton Slayer', 
        desc: 'Defeat 5 skeleton minions in the dungeon',
        progress: 1,
        max: 5,
        reward: '100 XP, Iron Sword',
        icon: '💀'
      },
      { 
        title: 'Explore the Cave', 
        desc: 'Find and enter the mysterious cave',
        progress: 0,
        max: 1,
        reward: '75 XP, Health Potion x3',
        icon: '🕳️'
      }
    ];

    quests.forEach(q => {
      const questCard = document.createElement('div');
      questCard.style.cssText = `
        background: ${UITheme.SECONDARY_BG};
        border: 2px solid ${UITheme.BORDER_COLOR};
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        transition: all 0.3s;
        cursor: pointer;
      `;
      questCard.innerHTML = `
        <div style="display: flex; gap: 15px;">
          <div style="font-size: 32px;">${q.icon}</div>
          <div style="flex: 1;">
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold; font-size: 16px; margin-bottom: 8px;">${q.title}</div>
            <div style="color: ${UITheme.TEXT_SECONDARY}; font-size: 13px; margin-bottom: 10px;">${q.desc}</div>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px;">
                <span style="color: ${UITheme.TEXT_SECONDARY};">Progress</span>
                <span style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">${q.progress}/${q.max}</span>
              </div>
              ${UITheme.createProgressBar(q.progress, q.max, '#00ff00').outerHTML}
            </div>
            <div style="color: ${UITheme.TEXT_GOLD}; font-size: 12px;">🎁 Reward: ${q.reward}</div>
          </div>
        </div>
      `;
      questCard.addEventListener('mouseenter', () => {
        questCard.style.borderColor = UITheme.BORDER_GLOW;
        questCard.style.boxShadow = `0 0 15px rgba(0, 255, 255, 0.3)`;
      });
      questCard.addEventListener('mouseleave', () => {
        questCard.style.borderColor = UITheme.BORDER_COLOR;
        questCard.style.boxShadow = 'none';
      });
      activeSection.appendChild(questCard);
    });

    content.appendChild(activeSection);
    panel.appendChild(content);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    panel.appendChild(closeBtn);

    this.uiContainer.appendChild(panel);
    this.panels.set('quests', panel);
  }

  /**
   * Create character panel
   */
  private createCharacterPanel() {
    const panel = UITheme.createPanel('👤 CHARACTER', '750px', '650px');
    panel.id = 'character-panel';

    const content = document.createElement('div');
    content.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 20px; height: calc(100% - 80px);';

    // Left: Stats
    const statsColumn = document.createElement('div');
    statsColumn.innerHTML = `
      <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 20px; height: 100%;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 20px;">📊 Core Stats</h3>
        ${this.createStatRow('💪 Strength', 10, 5)}
        ${this.createStatRow('🎯 Dexterity', 10, 5)}
        ${this.createStatRow('🧠 Intelligence', 10, 5)}
        ${this.createStatRow('❤️ Vitality', 10, 5)}
        ${this.createStatRow('⚡ Agility', 10, 5)}
        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid ${UITheme.BORDER_COLOR};">
          <div style="text-align: center; color: ${UITheme.TEXT_GOLD}; font-weight: bold; margin-bottom: 10px;">
            Available Points: 5
          </div>
        </div>
      </div>
    `;

    // Right: Combat Stats & Equipment
    const combatColumn = document.createElement('div');
    combatColumn.style.cssText = 'display: flex; flex-direction: column; gap: 20px;';
    combatColumn.innerHTML = `
      <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 20px;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">⚔️ Combat</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY};">Attack</div>
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">10-15</div>
          </div>
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY};">Defense</div>
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">8</div>
          </div>
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY};">Crit Chance</div>
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">5%</div>
          </div>
          <div>
            <div style="color: ${UITheme.TEXT_SECONDARY};">Crit Damage</div>
            <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">150%</div>
          </div>
        </div>
      </div>
      <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 20px; flex: 1;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">🛡️ Equipment</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          ${Array(9).fill(0).map(() => UITheme.createItemSlot().outerHTML).join('')}
        </div>
      </div>
    `;

    content.appendChild(statsColumn);
    content.appendChild(combatColumn);
    panel.appendChild(content);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    panel.appendChild(closeBtn);

    this.uiContainer.appendChild(panel);
    this.panels.set('character', panel);
  }

  private createStatRow(name: string, value: number, _maxIncrease: number): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
        <div style="color: ${UITheme.TEXT_SECONDARY};">${name}</div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="color: ${UITheme.TEXT_PRIMARY}; font-weight: bold; font-size: 18px;">${value}</div>
          <button style="background: ${UITheme.BUTTON_GRADIENT}; border: 1px solid ${UITheme.BORDER_COLOR}; color: ${UITheme.TEXT_PRIMARY}; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
        </div>
      </div>
    `;
  }

  /**
   * Create map panel
   */
  private createMapPanel() {
    const panel = UITheme.createPanel('🗺️ WORLD MAP', '900px', '700px');
    panel.id = 'map-panel';

    const content = document.createElement('div');
    content.style.cssText = 'height: calc(100% - 80px);';

    const mapContainer = document.createElement('div');
    mapContainer.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba(20,50,80,0.3), rgba(10,30,50,0.5));
      border: 2px solid ${UITheme.BORDER_COLOR};
      border-radius: 8px;
      position: relative;
      overflow: hidden;
    `;
    
    // Grid overlay
    mapContainer.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: 
        linear-gradient(${UITheme.BORDER_COLOR}20 1px, transparent 1px),
        linear-gradient(90deg, ${UITheme.BORDER_COLOR}20 1px, transparent 1px);
        background-size: 50px 50px;"></div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;">🧭</div>
        <div style="color: ${UITheme.TEXT_GOLD}; font-size: 24px; font-weight: bold; margin-bottom: 10px;">FANTASY REALM</div>
        <div style="color: ${UITheme.TEXT_SECONDARY};">You are here</div>
      </div>
      <div style="position: absolute; top: 20px; left: 20px; background: ${UITheme.PRIMARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 15px;">
        <div style="color: ${UITheme.TEXT_GOLD}; font-weight: bold; margin-bottom: 10px;">🏰 Locations</div>
        <div style="font-size: 13px; line-height: 2;">
          <div style="color: ${UITheme.TEXT_PRIMARY};">🏘️ Starting Village</div>
          <div style="color: ${UITheme.TEXT_SECONDARY};">🌲 Dark Forest</div>
          <div style="color: ${UITheme.TEXT_SECONDARY};">⛰️ Mountain Pass</div>
          <div style="color: ${UITheme.TEXT_SECONDARY};">🏰 Ancient Castle</div>
          <div style="color: ${UITheme.TEXT_SECONDARY};">🕳️ Crystal Caves</div>
        </div>
      </div>
    `;

    content.appendChild(mapContainer);
    panel.appendChild(content);

    const closeBtn = UITheme.createButton('CLOSE', () => this.closePanel());
    closeBtn.style.cssText += 'margin-top: 15px; width: 100%;';
    panel.appendChild(closeBtn);

    this.uiContainer.appendChild(panel);
    this.panels.set('map', panel);
  }

  /**
   * Create settings panel
   */
  private createSettingsPanel() {
    const panel = UITheme.createPanel('⚙️ SETTINGS', '600px', '650px');
    panel.id = 'settings-panel';

    const content = document.createElement('div');
    content.style.cssText = 'height: calc(100% - 80px); overflow-y: auto;';

    content.innerHTML = `
      <div style="margin-bottom: 25px;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">🎨 Graphics</h3>
        <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 15px;">
          ${this.createSettingRow('Quality', 'select', ['Low', 'Medium', 'High', 'Ultra'])}
          ${this.createSettingRow('Shadows', 'checkbox', null, true)}
          ${this.createSettingRow('Anti-Aliasing', 'checkbox', null, false)}
          ${this.createSettingRow('View Distance', 'slider', null, 75)}
          ${this.createSettingRow('FPS Limit', 'select', ['30', '60', '120', 'Unlimited'])}
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">🔊 Audio</h3>
        <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 15px;">
          ${this.createSettingRow('Master Volume', 'slider', null, 70)}
          ${this.createSettingRow('Music Volume', 'slider', null, 50)}
          ${this.createSettingRow('SFX Volume', 'slider', null, 80)}
          ${this.createSettingRow('Ambient Volume', 'slider', null, 40)}
        </div>
      </div>

      <div style="margin-bottom: 25px;">
        <h3 style="color: ${UITheme.TEXT_GOLD}; margin-bottom: 15px;">🎮 Gameplay</h3>
        <div style="background: ${UITheme.SECONDARY_BG}; border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 8px; padding: 15px;">
          ${this.createSettingRow('Mouse Sensitivity', 'slider', null, 50)}
          ${this.createSettingRow('Invert Y-Axis', 'checkbox', null, false)}
          ${this.createSettingRow('Show Tutorials', 'checkbox', null, true)}
          ${this.createSettingRow('Auto-Save', 'checkbox', null, true)}
        </div>
      </div>
    `;

    panel.appendChild(content);

    const buttonRow = document.createElement('div');
    buttonRow.style.cssText = 'display: flex; gap: 10px; margin-top: 15px;';
    
    const applyBtn = UITheme.createButton('APPLY', () => {
      UITheme.showNotification('Settings applied!', 2000, 'success');
      this.closePanel();
    });
    const resetBtn = UITheme.createButton('RESET TO DEFAULT', () => {
      UITheme.showNotification('Settings reset to defaults', 2000, 'info');
    });
    const closeBtn = UITheme.createButton('CANCEL', () => this.closePanel());

    applyBtn.style.flex = '1';
    resetBtn.style.flex = '1';
    closeBtn.style.flex = '1';

    buttonRow.appendChild(applyBtn);
    buttonRow.appendChild(resetBtn);
    buttonRow.appendChild(closeBtn);
    panel.appendChild(buttonRow);

    this.uiContainer.appendChild(panel);
    this.panels.set('settings', panel);
  }

  private createSettingRow(label: string, type: string, options: string[] | null = null, value: unknown = null): string {
    let control = '';
    
    if (type === 'checkbox') {
      control = `<input type="checkbox" ${value ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">`;
    } else if (type === 'slider') {
      control = `
        <div style="flex: 1; display: flex; align-items: center; gap: 10px;">
          <input type="range" min="0" max="100" value="${value}" style="flex: 1; cursor: pointer;">
          <span style="min-width: 40px; text-align: right; color: ${UITheme.TEXT_PRIMARY}; font-weight: bold;">${value}%</span>
        </div>
      `;
    } else if (type === 'select' && options) {
      control = `
        <select style="padding: 8px; background: rgba(0,0,0,0.5); border: 2px solid ${UITheme.BORDER_COLOR}; border-radius: 5px; color: ${UITheme.TEXT_PRIMARY}; cursor: pointer;">
          ${options.map(opt => `<option>${opt}</option>`).join('')}
        </select>
      `;
    }

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
        <label style="color: ${UITheme.TEXT_SECONDARY};">${label}</label>
        ${control}
      </div>
    `;
  }

  /**
   * Toggle UI panel
   */
  togglePanel(panel: UIPanel) {
    // Close all panels first
    this.panels.forEach((panelElement) => {
      panelElement.style.display = 'none';
    });

    // Open requested panel
    if (panel !== 'none') {
      const panelElement = this.panels.get(panel);
      if (panelElement) {
        panelElement.style.display = 'block';
        panelElement.style.animation = 'fadeIn 0.3s ease';
        this.activePanel = panel;
      }
    } else {
      this.activePanel = 'none';
    }
  }

  /**
   * Close active panel
   */
  closePanel() {
    this.togglePanel('none');
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
    // Update health
    if (stats.health !== undefined && stats.maxHealth !== undefined) {
      const healthText = document.getElementById('health-text');
      if (healthText) {
        healthText.textContent = `${Math.floor(stats.health)}/${stats.maxHealth}`;
      }
      const healthBar = document.querySelector('#health-bar-container > div > div') as HTMLElement;
      if (healthBar) {
        const percentage = (stats.health / stats.maxHealth) * 100;
        healthBar.style.width = `${percentage}%`;
      }
    }

    // Update mana
    if (stats.mana !== undefined && stats.maxMana !== undefined) {
      const manaText = document.getElementById('mana-text');
      if (manaText) {
        manaText.textContent = `${Math.floor(stats.mana)}/${stats.maxMana}`;
      }
      const manaBar = document.querySelector('#mana-bar-container > div > div') as HTMLElement;
      if (manaBar) {
        const percentage = (stats.mana / stats.maxMana) * 100;
        manaBar.style.width = `${percentage}%`;
      }
    }

    // Update level
    if (stats.level !== undefined) {
      const level = document.getElementById('level');
      if (level) level.textContent = `${stats.level}`;
    }

    // Update XP
    if (stats.experience !== undefined && stats.experienceToNext !== undefined) {
      const xp = document.getElementById('xp');
      if (xp) xp.textContent = `${stats.experience}/${stats.experienceToNext}`;
    }
  }

  /**
   * Update FPS counter
   */
  updateFPS(fps: number) {
    const fpsValue = document.getElementById('fps-value');
    if (fpsValue) {
      fpsValue.textContent = Math.floor(fps).toString();
      
      // Color code based on performance
      if (fps >= 55) {
        fpsValue.style.color = '#00ff00';
      } else if (fps >= 30) {
        fpsValue.style.color = '#ffaa00';
      } else {
        fpsValue.style.color = '#ff0000';
      }
    }
  }

  /**
   * Get active panel
   */
  getActivePanel(): UIPanel {
    return this.activePanel;
  }

  /**
   * Show message notification
   */
  showMessage(message: string, duration: number = 3000, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    UITheme.showNotification(message, duration, type);
  }

  /**
   * Update method called every frame
   */
  update(_deltaTime: number) {
    // Update any animated UI elements
  }

  /**
   * Cleanup
   */
  dispose() {
    if (this.uiContainer && this.uiContainer.parentElement) {
      this.uiContainer.parentElement.removeChild(this.uiContainer);
    }
  }
}
