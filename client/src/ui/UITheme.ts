/**
 * UI Theme - Consistent styling matching the start menu
 * Fantasy-themed with blue gradients and glowing borders
 */
export class UITheme {
  // Colors from start menu
  static readonly PRIMARY_BG = 'rgba(0, 0, 0, 0.95)';
  static readonly SECONDARY_BG = 'rgba(20, 40, 80, 0.85)';
  static readonly BUTTON_GRADIENT = 'linear-gradient(135deg, rgba(45, 74, 110, 0.9), rgba(26, 43, 74, 0.9))';
  static readonly BUTTON_HOVER = 'linear-gradient(135deg, rgba(55, 94, 140, 0.95), rgba(36, 63, 104, 0.95))';
  static readonly BORDER_COLOR = 'rgba(0, 255, 255, 0.6)';
  static readonly BORDER_GLOW = '#00ffff';
  static readonly TEXT_PRIMARY = '#ffffff';
  static readonly TEXT_SECONDARY = '#b0c4de';
  static readonly TEXT_GOLD = '#ffd700';
  static readonly SHADOW = '0 0 20px rgba(0, 255, 255, 0.3)';
  
  // Typography
  static readonly FONT_TITLE = "'Cinzel', 'Georgia', serif";
  static readonly FONT_BODY = "'Arial', sans-serif";
  
  /**
   * Create a styled button matching the menu theme
   */
  static createButton(text: string, onClick?: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      background: ${this.BUTTON_GRADIENT};
      border: 2px solid ${this.BORDER_COLOR};
      border-radius: 8px;
      color: ${this.TEXT_PRIMARY};
      font-family: ${this.FONT_BODY};
      font-size: 16px;
      font-weight: bold;
      letter-spacing: 2px;
      text-transform: uppercase;
      padding: 15px 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: ${this.SHADOW}, inset 0 1px 0 rgba(255, 255, 255, 0.2);
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = this.BUTTON_HOVER;
      button.style.borderColor = this.BORDER_GLOW;
      button.style.boxShadow = `0 0 30px rgba(0, 255, 255, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)`;
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = this.BUTTON_GRADIENT;
      button.style.borderColor = this.BORDER_COLOR;
      button.style.boxShadow = this.SHADOW + ', inset 0 1px 0 rgba(255, 255, 255, 0.2)';
      button.style.transform = 'translateY(0)';
    });
    
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    return button;
  }
  
  /**
   * Create a styled panel matching the menu theme
   */
  static createPanel(title: string, width: string = '600px', height: string = 'auto'): HTMLDivElement {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${width};
      max-width: 90vw;
      height: ${height};
      max-height: 90vh;
      background: ${this.PRIMARY_BG};
      border: 2px solid ${this.BORDER_COLOR};
      border-radius: 10px;
      padding: 30px;
      box-shadow: ${this.SHADOW};
      color: ${this.TEXT_PRIMARY};
      font-family: ${this.FONT_BODY};
      display: none;
      overflow-y: auto;
      z-index: 5000;
    `;
    
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0 0 20px 0;
      color: ${this.TEXT_GOLD};
      font-family: ${this.FONT_TITLE};
      font-size: 32px;
      text-align: center;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      letter-spacing: 3px;
    `;
    
    panel.appendChild(titleElement);
    
    return panel;
  }
  
  /**
   * Create styled input field
   */
  static createInput(placeholder: string = ''): HTMLInputElement {
    const input = document.createElement('input');
    input.placeholder = placeholder;
    input.style.cssText = `
      width: 100%;
      padding: 12px;
      background: ${this.SECONDARY_BG};
      border: 2px solid ${this.BORDER_COLOR};
      border-radius: 5px;
      color: ${this.TEXT_PRIMARY};
      font-family: ${this.FONT_BODY};
      font-size: 14px;
      outline: none;
      transition: all 0.3s ease;
    `;
    
    input.addEventListener('focus', () => {
      input.style.borderColor = this.BORDER_GLOW;
      input.style.boxShadow = `0 0 15px rgba(0, 255, 255, 0.4)`;
    });
    
    input.addEventListener('blur', () => {
      input.style.borderColor = this.BORDER_COLOR;
      input.style.boxShadow = 'none';
    });
    
    return input;
  }
  
  /**
   * Create styled progress bar
   */
  static createProgressBar(current: number, max: number, color: string = '#00ff00'): HTMLDivElement {
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: 24px;
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid ${this.BORDER_COLOR};
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    `;
    
    const fill = document.createElement('div');
    const percentage = Math.min(100, (current / max) * 100);
    fill.style.cssText = `
      width: ${percentage}%;
      height: 100%;
      background: linear-gradient(90deg, ${color}, ${color}dd);
      border-radius: 10px;
      transition: width 0.3s ease;
      box-shadow: 0 0 10px ${color};
    `;
    
    const text = document.createElement('div');
    text.textContent = `${Math.floor(current)}/${max}`;
    text.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: ${this.TEXT_PRIMARY};
      font-weight: bold;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
      font-size: 12px;
    `;
    
    container.appendChild(fill);
    container.appendChild(text);
    
    return container;
  }
  
  /**
   * Create item slot (for inventory, etc.)
   */
  static createItemSlot(): HTMLDivElement {
    const slot = document.createElement('div');
    slot.style.cssText = `
      width: 80px;
      height: 80px;
      background: ${this.SECONDARY_BG};
      border: 2px solid ${this.BORDER_COLOR};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    `;
    
    slot.addEventListener('mouseenter', () => {
      slot.style.borderColor = this.BORDER_GLOW;
      slot.style.boxShadow = `0 0 15px rgba(0, 255, 255, 0.4)`;
      slot.style.transform = 'scale(1.05)';
    });
    
    slot.addEventListener('mouseleave', () => {
      slot.style.borderColor = this.BORDER_COLOR;
      slot.style.boxShadow = 'none';
      slot.style.transform = 'scale(1)';
    });
    
    return slot;
  }
  
  /**
   * Show notification
   */
  static showNotification(message: string, duration: number = 3000, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notification = document.createElement('div');
    
    const colors = {
      info: this.BORDER_COLOR,
      success: '#00ff00',
      warning: '#ffaa00',
      error: '#ff0000'
    };
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.PRIMARY_BG};
      border: 2px solid ${colors[type]};
      border-radius: 8px;
      padding: 15px 25px;
      color: ${this.TEXT_PRIMARY};
      font-family: ${this.FONT_BODY};
      box-shadow: 0 0 20px ${colors[type]}40;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      min-width: 250px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, duration);
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;
document.head.appendChild(style);
