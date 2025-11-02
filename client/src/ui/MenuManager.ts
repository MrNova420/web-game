/**
 * MenuManager - Manages the main menu and game flow
 * Integrates the game menu HTML as the initial screen
 */
export class MenuManager {
  private menuContainer: HTMLElement | null = null;
  private isMenuVisible: boolean = true;
  private onStartCallback: (() => void) | null = null;

  constructor() {
    this.createMenu();
  }

  /**
   * Creates the main menu UI based on game-menu (2).html
   */
  private createMenu(): void {
    this.menuContainer = document.createElement('div');
    this.menuContainer.id = 'game-menu';
    this.menuContainer.style.cssText = `
      position: fixed;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      font-family: 'Cinzel', 'Georgia', serif;
      background: linear-gradient(135deg, rgba(15, 12, 41, 0.95) 0%, rgba(48, 43, 99, 0.95) 50%, rgba(36, 36, 62, 0.95) 100%);
      backdrop-filter: blur(10px);
      transition: opacity 0.5s ease;
    `;

    // Video background
    const videoBackground = document.createElement('video');
    videoBackground.autoplay = true;
    videoBackground.loop = true;
    videoBackground.muted = true;
    videoBackground.playsInline = true;
    videoBackground.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
      opacity: 0.3;
    `;
    // Note: Video source would need to be added if available
    // videoBackground.src = '/assets/background-video.mp4';

    // Menu content
    const menuContent = document.createElement('div');
    menuContent.style.cssText = `
      text-align: center;
      z-index: 2;
      max-width: 600px;
      padding: 40px;
    `;

    // Game title
    const title = document.createElement('h1');
    title.textContent = '⚔️ FANTASY SURVIVAL MMO ⚔️';
    title.style.cssText = `
      font-size: clamp(32px, 6vw, 64px);
      font-weight: bold;
      color: #fff;
      text-shadow: 0 0 20px rgba(138, 43, 226, 0.8),
                   0 0 40px rgba(138, 43, 226, 0.6),
                   0 0 60px rgba(138, 43, 226, 0.4),
                   3px 3px 10px rgba(0, 0, 0, 0.8);
      margin-bottom: 30px;
      letter-spacing: 3px;
      animation: glow 2s ease-in-out infinite alternate;
    `;
    menuContent.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Embark on an Epic Adventure';
    subtitle.style.cssText = `
      font-size: clamp(16px, 3vw, 24px);
      color: #b794f4;
      margin-bottom: 40px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
      font-style: italic;
    `;
    menuContent.appendChild(subtitle);

    // Menu buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    `;

    // Create menu buttons
    const buttons = [
      { text: '▶ START GAME', action: () => this.startGame(), primary: true },
      { text: '📖 TUTORIAL', action: () => this.showTutorial(), primary: false },
      { text: '⚙️ SETTINGS', action: () => this.showSettings(), primary: false },
      { text: '🎮 CONTROLS', action: () => this.showControls(), primary: false },
      { text: 'ℹ️ ABOUT', action: () => this.showAbout(), primary: false }
    ];

    buttons.forEach((btn, index) => {
      const button = this.createMenuButton(btn.text, btn.action, btn.primary);
      button.tabIndex = index;
      buttonsContainer.appendChild(button);
    });

    menuContent.appendChild(buttonsContainer);

    // Version info
    const version = document.createElement('div');
    version.textContent = 'Version 1.0.0 Beta';
    version.style.cssText = `
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 20px;
    `;
    menuContent.appendChild(version);

    this.menuContainer.appendChild(menuContent);

    // Add glow animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glow {
        from {
          text-shadow: 0 0 20px rgba(138, 43, 226, 0.8),
                       0 0 40px rgba(138, 43, 226, 0.6),
                       0 0 60px rgba(138, 43, 226, 0.4),
                       3px 3px 10px rgba(0, 0, 0, 0.8);
        }
        to {
          text-shadow: 0 0 30px rgba(138, 43, 226, 1),
                       0 0 50px rgba(138, 43, 226, 0.8),
                       0 0 70px rgba(138, 43, 226, 0.6),
                       3px 3px 10px rgba(0, 0, 0, 0.8);
        }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(this.menuContainer);
  }

  /**
   * Creates a styled menu button
   */
  private createMenuButton(text: string, action: () => void, primary: boolean = false): HTMLElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'menu-button';
    
    const baseStyle = `
      width: 100%;
      max-width: 400px;
      padding: 18px 40px;
      font-size: clamp(16px, 2.5vw, 22px);
      font-weight: bold;
      font-family: 'Cinzel', 'Georgia', serif;
      color: #fff;
      border: 3px solid;
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 2px;
      position: relative;
      overflow: hidden;
    `;

    if (primary) {
      button.style.cssText = baseStyle + `
        background: linear-gradient(135deg, #8a2be2 0%, #9b59b6 100%);
        border-color: #b794f4;
        box-shadow: 0 10px 30px rgba(138, 43, 226, 0.4),
                    inset 0 0 20px rgba(255, 255, 255, 0.1);
      `;
    } else {
      button.style.cssText = baseStyle + `
        background: linear-gradient(135deg, rgba(138, 43, 226, 0.3) 0%, rgba(155, 89, 182, 0.3) 100%);
        border-color: rgba(183, 148, 244, 0.5);
        box-shadow: 0 5px 15px rgba(138, 43, 226, 0.2);
      `;
    }

    button.addEventListener('click', () => {
      // Button click animation
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
        action();
      }, 100);
    });

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-5px) scale(1.05)';
      button.style.boxShadow = primary 
        ? '0 15px 40px rgba(138, 43, 226, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2)'
        : '0 10px 25px rgba(138, 43, 226, 0.4)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
      button.style.boxShadow = primary
        ? '0 10px 30px rgba(138, 43, 226, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)'
        : '0 5px 15px rgba(138, 43, 226, 0.2)';
    });

    return button;
  }

  /**
   * Start the game - hides menu and triggers game initialization
   */
  private startGame(): void {
    console.log('[MenuManager] Starting game...');
    if (this.onStartCallback) {
      this.hide();
      this.onStartCallback();
    }
  }

  /**
   * Show tutorial modal
   */
  private showTutorial(): void {
    this.showModal(
      '📖 Tutorial',
      `
        <h3>Welcome to Fantasy Survival MMO!</h3>
        <p><strong>Movement:</strong> WASD keys to move around</p>
        <p><strong>Camera:</strong> Move mouse to look around</p>
        <p><strong>Interact:</strong> Press E to interact with objects</p>
        <p><strong>Inventory:</strong> Press I to open your inventory</p>
        <p><strong>Quest Log:</strong> Press Q to view quests</p>
        <p><strong>Character:</strong> Press C for character stats</p>
        <p><strong>Map:</strong> Press M to open the map</p>
        <p>Explore the world, gather resources, craft items, and survive!</p>
      `
    );
  }

  /**
   * Show settings modal
   */
  private showSettings(): void {
    this.showModal(
      '⚙️ Settings',
      `
        <h3>Game Settings</h3>
        <p>Graphics Quality: Auto (adjusts based on device)</p>
        <p>Audio Volume: 100%</p>
        <p>Mouse Sensitivity: Medium</p>
        <p><em>Advanced settings will be available in-game (F1)</em></p>
      `
    );
  }

  /**
   * Show controls modal
   */
  private showControls(): void {
    this.showModal(
      '🎮 Controls',
      `
        <h3>Keyboard Controls</h3>
        <p><strong>Movement:</strong> W/A/S/D</p>
        <p><strong>Jump:</strong> Space</p>
        <p><strong>Sprint:</strong> Shift</p>
        <p><strong>Interact:</strong> E</p>
        <p><strong>Inventory:</strong> I</p>
        <p><strong>Quest Log:</strong> Q</p>
        <p><strong>Character:</strong> C</p>
        <p><strong>Map:</strong> M</p>
        <p><strong>Debug Console:</strong> F1</p>
        
        <h3>Mouse Controls</h3>
        <p><strong>Look Around:</strong> Move mouse</p>
        <p><strong>Attack:</strong> Left Click</p>
        <p><strong>Use Ability:</strong> Right Click</p>
        
        <h3>Mobile/Touch Controls</h3>
        <p>Touch controls are automatically enabled on mobile devices</p>
      `
    );
  }

  /**
   * Show about modal
   */
  private showAbout(): void {
    this.showModal(
      'ℹ️ About',
      `
        <h3>Fantasy Survival MMO</h3>
        <p>Version 1.0.0 Beta</p>
        <p>A fully-featured 3D multiplayer survival fantasy game built with modern web technologies.</p>
        <p><strong>Features:</strong></p>
        <ul style="text-align: left; max-width: 400px; margin: 10px auto;">
          <li>Procedurally generated open world</li>
          <li>7 unique biomes to explore</li>
          <li>Advanced crafting system with 500+ items</li>
          <li>Dynamic weather and day/night cycle</li>
          <li>Multiplayer support</li>
          <li>Cross-platform (Desktop, Tablet, Mobile)</li>
        </ul>
      `
    );
  }

  /**
   * Show a modal dialog
   */
  private showModal(title: string, content: string): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%);
      padding: 30px;
      border-radius: 15px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      color: white;
      border: 3px solid #8a2be2;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
    `;

    modalContent.innerHTML = `
      <h2 style="color: #b794f4; margin-bottom: 20px; text-align: center;">${title}</h2>
      <div style="line-height: 1.8; font-size: 16px;">${content}</div>
      <button id="modal-close" style="
        margin-top: 20px;
        width: 100%;
        padding: 15px;
        background: linear-gradient(135deg, #8a2be2 0%, #9b59b6 100%);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
      ">Close</button>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    const closeButton = document.getElementById('modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => modal.remove());
      closeButton.addEventListener('mouseenter', () => {
        closeButton.style.transform = 'scale(1.05)';
      });
      closeButton.addEventListener('mouseleave', () => {
        closeButton.style.transform = 'scale(1)';
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Register callback for when game starts
   */
  public onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * Hide the menu
   */
  public hide(): void {
    if (this.menuContainer && this.isMenuVisible) {
      this.menuContainer.style.opacity = '0';
      setTimeout(() => {
        if (this.menuContainer) {
          this.menuContainer.style.display = 'none';
        }
        this.isMenuVisible = false;
      }, 500);
    }
  }

  /**
   * Show the menu
   */
  public show(): void {
    if (this.menuContainer && !this.isMenuVisible) {
      this.menuContainer.style.display = 'flex';
      setTimeout(() => {
        if (this.menuContainer) {
          this.menuContainer.style.opacity = '1';
        }
        this.isMenuVisible = true;
      }, 10);
    }
  }

  /**
   * Check if menu is visible
   */
  public isVisible(): boolean {
    return this.isMenuVisible;
  }
}
