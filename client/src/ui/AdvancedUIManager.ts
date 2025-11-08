/**
 * AdvancedUIManager - Professional UI management
 * ENHANCEMENT: Following AUTONOMOUS_DEVELOPMENT_GUIDE2.MD UI Systems
 * HUD, menus, notifications, tooltips
 */

interface UIElement {
  id: string;
  type: 'panel' | 'button' | 'text' | 'image' | 'progress' | 'input';
  visible: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content?: string;
  onClick?: () => void;
  element?: HTMLElement;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
  timestamp: number;
}

export class AdvancedUIManager {
  private container: HTMLElement;
  private elements = new Map<string, UIElement>();
  private notifications: Notification[] = [];
  private notificationId = 0;
  
  // UI states
  private currentMenu: string | null = null;
  private hudVisible = true;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.setupDefaultUI();
    console.log('[AdvancedUIManager] Initialized');
  }
  
  /**
   * Setup default HUD elements
   */
  private setupDefaultUI(): void {
    // Health bar
    this.createProgressBar('health_bar', {
      x: 20,
      y: window.innerHeight - 60,
      width: 200,
      height: 20,
      color: '#ff0000',
      backgroundColor: '#440000'
    });
    
    // Stamina bar
    this.createProgressBar('stamina_bar', {
      x: 20,
      y: window.innerHeight - 35,
      width: 200,
      height: 15,
      color: '#00ff00',
      backgroundColor: '#004400'
    });
    
    // Experience bar
    this.createProgressBar('xp_bar', {
      x: window.innerWidth / 2 - 150,
      y: window.innerHeight - 30,
      width: 300,
      height: 10,
      color: '#ffaa00',
      backgroundColor: '#443300'
    });
    
    // Level display
    this.createElement({
      id: 'level_text',
      type: 'text',
      visible: true,
      position: { x: 20, y: window.innerHeight - 80 },
      size: { width: 100, height: 30 },
      content: 'Level 1'
    });
    
    // FPS counter
    this.createElement({
      id: 'fps_counter',
      type: 'text',
      visible: true,
      position: { x: window.innerWidth - 100, y: 10 },
      size: { width: 80, height: 20 },
      content: 'FPS: 60'
    });
    
    // Notification container
    const notifContainer = document.createElement('div');
    notifContainer.id = 'notification_container';
    notifContainer.style.position = 'absolute';
    notifContainer.style.top = '20px';
    notifContainer.style.right = '20px';
    notifContainer.style.zIndex = '1000';
    this.container.appendChild(notifContainer);
    
    console.log('[AdvancedUIManager] Default HUD created');
  }
  
  /**
   * Create UI element
   */
  createElement(config: Omit<UIElement, 'element'>): void {
    const element = document.createElement('div');
    element.id = config.id;
    element.style.position = 'absolute';
    element.style.left = `${config.position.x}px`;
    element.style.top = `${config.position.y}px`;
    element.style.width = `${config.size.width}px`;
    element.style.height = `${config.size.height}px`;
    element.style.display = config.visible ? 'block' : 'none';
    element.style.color = '#ffffff';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14px';
    element.style.pointerEvents = config.type === 'button' ? 'auto' : 'none';
    
    if (config.content) {
      element.textContent = config.content;
    }
    
    if (config.onClick) {
      element.style.cursor = 'pointer';
      element.addEventListener('click', config.onClick);
    }
    
    this.container.appendChild(element);
    
    this.elements.set(config.id, {
      ...config,
      element
    });
  }
  
  /**
   * Create progress bar
   */
  createProgressBar(id: string, config: {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    backgroundColor: string;
  }): void {
    const container = document.createElement('div');
    container.id = id;
    container.style.position = 'absolute';
    container.style.left = `${config.x}px`;
    container.style.top = `${config.y}px`;
    container.style.width = `${config.width}px`;
    container.style.height = `${config.height}px`;
    container.style.backgroundColor = config.backgroundColor;
    container.style.border = '2px solid #000000';
    container.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
    
    const fill = document.createElement('div');
    fill.id = `${id}_fill`;
    fill.style.width = '100%';
    fill.style.height = '100%';
    fill.style.backgroundColor = config.color;
    fill.style.transition = 'width 0.3s';
    
    container.appendChild(fill);
    this.container.appendChild(container);
    
    this.elements.set(id, {
      id,
      type: 'progress',
      visible: true,
      position: { x: config.x, y: config.y },
      size: { width: config.width, height: config.height },
      element: container
    });
  }
  
  /**
   * Update progress bar
   */
  updateProgressBar(id: string, percentage: number): void {
    const fill = document.getElementById(`${id}_fill`);
    if (fill) {
      fill.style.width = `${Math.max(0, Math.min(100, percentage))}%`;
    }
  }
  
  /**
   * Update text element
   */
  updateText(id: string, text: string): void {
    const uiElement = this.elements.get(id);
    if (uiElement && uiElement.element) {
      uiElement.element.textContent = text;
      uiElement.content = text;
    }
  }
  
  /**
   * Show notification
   */
  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', duration: number = 3000): void {
    const id = `notification_${this.notificationId++}`;
    const notification: Notification = {
      id,
      message,
      type,
      duration,
      timestamp: Date.now()
    };
    
    this.notifications.push(notification);
    
    const element = document.createElement('div');
    element.id = id;
    element.style.padding = '10px 15px';
    element.style.marginBottom = '10px';
    element.style.borderRadius = '5px';
    element.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
    element.style.animation = 'slideIn 0.3s';
    element.style.pointerEvents = 'auto';
    element.textContent = message;
    
    // Set color based on type
    const colors = {
      info: { bg: '#2196F3', text: '#ffffff' },
      success: { bg: '#4CAF50', text: '#ffffff' },
      warning: { bg: '#FF9800', text: '#000000' },
      error: { bg: '#F44336', text: '#ffffff' }
    };
    
    element.style.backgroundColor = colors[type].bg;
    element.style.color = colors[type].text;
    
    const container = document.getElementById('notification_container');
    if (container) {
      container.appendChild(element);
    }
    
    // Auto-remove
    setTimeout(() => {
      this.removeNotification(id);
    }, duration);
  }
  
  /**
   * Remove notification
   */
  private removeNotification(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      element.style.animation = 'slideOut 0.3s';
      setTimeout(() => {
        element.remove();
      }, 300);
    }
    
    this.notifications = this.notifications.filter(n => n.id !== id);
  }
  
  /**
   * Show/hide element
   */
  setElementVisible(id: string, visible: boolean): void {
    const uiElement = this.elements.get(id);
    if (uiElement && uiElement.element) {
      uiElement.element.style.display = visible ? 'block' : 'none';
      uiElement.visible = visible;
    }
  }
  
  /**
   * Show/hide HUD
   */
  setHUDVisible(visible: boolean): void {
    this.hudVisible = visible;
    this.elements.forEach(element => {
      if (element.element) {
        element.element.style.display = visible ? 'block' : 'none';
      }
    });
  }
  
  /**
   * Update (call every frame)
   */
  update(stats: {
    fps: number;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    xp: number;
    xpToNext: number;
    level: number;
  }): void {
    // Update FPS
    this.updateText('fps_counter', `FPS: ${Math.round(stats.fps)}`);
    
    // Update health bar
    this.updateProgressBar('health_bar', (stats.health / stats.maxHealth) * 100);
    
    // Update stamina bar
    this.updateProgressBar('stamina_bar', (stats.stamina / stats.maxStamina) * 100);
    
    // Update XP bar
    this.updateProgressBar('xp_bar', (stats.xp / stats.xpToNext) * 100);
    
    // Update level text
    this.updateText('level_text', `Level ${stats.level}`);
  }
  
  /**
   * Cleanup
   */
  dispose(): void {
    this.elements.forEach(element => {
      if (element.element) {
        element.element.remove();
      }
    });
    this.elements.clear();
    this.notifications = [];
  }
}
