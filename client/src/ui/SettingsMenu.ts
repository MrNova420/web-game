/**
 * SettingsMenu - In-game settings overlay with full graphics controls
 * Allows users to optimize performance for their device
 */
export class SettingsMenu {
  private menuElement: HTMLDivElement | null = null;
  private isVisible: boolean = false;
  private onApplyCallback: ((settings: any) => void) | null = null;

  constructor() {
    this.createMenuUI();
    this.setupEventListeners();
  }

  private createMenuUI() {
    // Create main menu container
    const menu = document.createElement('div');
    menu.id = 'settings-menu';
    menu.style.cssText = `
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #00ffff;
      border-radius: 10px;
      padding: 20px;
      z-index: 10000;
      overflow-y: auto;
      color: white;
      font-family: Arial, sans-serif;
      box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
    `;

    menu.innerHTML = `
      <h2 style="color: #00ffff; margin-top: 0; text-align: center;">⚙️ Graphics & Performance Settings</h2>
      <p style="text-align: center; color: #aaa; font-size: 14px;">Adjust these settings to achieve 60 FPS on your device</p>
      
      <div style="margin: 20px 0;">
        <h3 style="color: #00ffff; border-bottom: 1px solid #00ffff; padding-bottom: 10px;">Graphics Quality</h3>
        
        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px;">Quality Preset:</label>
          <select id="quality-preset" style="width: 100%; padding: 8px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
            <option value="low">Low (Best Performance - 60+ FPS)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Better Graphics)</option>
            <option value="ultra">Ultra (Best Quality)</option>
          </select>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="shadows-toggle" style="margin-right: 10px; width: 18px; height: 18px;">
            <span>Enable Shadows (Expensive - reduces FPS)</span>
          </label>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="antialiasing-toggle" style="margin-right: 10px; width: 18px; height: 18px;">
            <span>Enable Anti-Aliasing (Expensive - reduces FPS)</span>
          </label>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px;">Render Distance: <span id="render-distance-value">100</span> chunks</label>
          <input type="range" id="render-distance" min="2" max="10" value="2" step="1" style="width: 100%;">
          <small style="color: #888;">Lower = Better FPS, Higher = See farther</small>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px;">Texture Quality:</label>
          <select id="texture-quality" style="width: 100%; padding: 8px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
            <option value="low">Low (Fastest)</option>
            <option value="medium">Medium (Balanced)</option>
            <option value="high">High (Best Quality)</option>
          </select>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px;">Pixel Ratio: <span id="pixel-ratio-value">1.0</span>x</label>
          <input type="range" id="pixel-ratio" min="0.5" max="2.0" value="1.0" step="0.1" style="width: 100%;">
          <small style="color: #888;">Lower = Better FPS but blurrier, Higher = Sharper but slower</small>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: block; margin-bottom: 5px;">Target FPS: <span id="target-fps-value">60</span></label>
          <select id="target-fps" style="width: 100%; padding: 8px; background: #222; color: white; border: 1px solid #444; border-radius: 5px;">
            <option value="30">30 FPS (Battery Saver)</option>
            <option value="60">60 FPS (Recommended)</option>
            <option value="120">120 FPS (High Refresh Rate Displays)</option>
          </select>
        </div>
      </div>

      <div style="margin: 20px 0;">
        <h3 style="color: #00ffff; border-bottom: 1px solid #00ffff; padding-bottom: 10px;">Advanced Performance</h3>
        
        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="vsync-toggle" style="margin-right: 10px; width: 18px; height: 18px;" checked>
            <span>VSync (Prevent screen tearing)</span>
          </label>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="gpu-instancing-toggle" style="margin-right: 10px; width: 18px; height: 18px;" checked>
            <span>GPU Instancing (Better performance)</span>
          </label>
        </div>

        <div style="margin: 15px 0;">
          <label style="display: flex; align-items: center;">
            <input type="checkbox" id="frustum-culling-toggle" style="margin-right: 10px; width: 18px; height: 18px;" checked>
            <span>Frustum Culling (Don't render off-screen objects)</span>
          </label>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="apply-settings" style="flex: 1; padding: 12px; background: #00ff00; color: black; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px;">
          ✓ Apply Settings
        </button>
        <button id="cancel-settings" style="flex: 1; padding: 12px; background: #ff0000; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px;">
          ✗ Cancel
        </button>
      </div>

      <div style="margin-top: 20px; padding: 15px; background: rgba(0, 255, 255, 0.1); border-radius: 5px; border: 1px solid #00ffff;">
        <strong style="color: #00ffff;">💡 Performance Tips:</strong>
        <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
          <li>For 60 FPS: Disable shadows, use Low/Medium quality, render distance ≤ 3</li>
          <li>Mobile devices: Use Low quality preset, disable anti-aliasing</li>
          <li>Battery saving: Lower pixel ratio to 0.7-0.8, target 30 FPS</li>
          <li>High-end PC: Feel free to max everything out!</li>
        </ul>
      </div>
    `;

    document.body.appendChild(menu);
    this.menuElement = menu;

    // Load current settings
    this.loadCurrentSettings();
  }

  private setupEventListeners() {
    // ESC key to toggle menu
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });

    // Apply button
    const applyBtn = document.getElementById('apply-settings');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.applySettings());
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancel-settings');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // Render distance slider
    const renderDistanceSlider = document.getElementById('render-distance') as HTMLInputElement;
    const renderDistanceValue = document.getElementById('render-distance-value');
    if (renderDistanceSlider && renderDistanceValue) {
      renderDistanceSlider.addEventListener('input', (e) => {
        const value = (e.target as HTMLInputElement).value;
        renderDistanceValue.textContent = value;
      });
    }

    // Pixel ratio slider
    const pixelRatioSlider = document.getElementById('pixel-ratio') as HTMLInputElement;
    const pixelRatioValue = document.getElementById('pixel-ratio-value');
    if (pixelRatioSlider && pixelRatioValue) {
      pixelRatioSlider.addEventListener('input', (e) => {
        const value = parseFloat((e.target as HTMLInputElement).value).toFixed(1);
        pixelRatioValue.textContent = value;
      });
    }

    // Quality preset - auto-adjust other settings
    const qualityPreset = document.getElementById('quality-preset') as HTMLSelectElement;
    if (qualityPreset) {
      qualityPreset.addEventListener('change', (e) => {
        this.applyQualityPreset((e.target as HTMLSelectElement).value as any);
      });
    }
  }

  private applyQualityPreset(quality: 'low' | 'medium' | 'high' | 'ultra') {
    const shadowsToggle = document.getElementById('shadows-toggle') as HTMLInputElement;
    const aaToggle = document.getElementById('antialiasing-toggle') as HTMLInputElement;
    const renderDistance = document.getElementById('render-distance') as HTMLInputElement;
    const textureQuality = document.getElementById('texture-quality') as HTMLSelectElement;
    const pixelRatio = document.getElementById('pixel-ratio') as HTMLInputElement;

    switch (quality) {
      case 'low':
        if (shadowsToggle) shadowsToggle.checked = false;
        if (aaToggle) aaToggle.checked = false;
        if (renderDistance) {
          renderDistance.value = '2';
          document.getElementById('render-distance-value')!.textContent = '2';
        }
        if (textureQuality) textureQuality.value = 'low';
        if (pixelRatio) {
          pixelRatio.value = '0.8';
          document.getElementById('pixel-ratio-value')!.textContent = '0.8';
        }
        break;
      case 'medium':
        if (shadowsToggle) shadowsToggle.checked = false;
        if (aaToggle) aaToggle.checked = false;
        if (renderDistance) {
          renderDistance.value = '3';
          document.getElementById('render-distance-value')!.textContent = '3';
        }
        if (textureQuality) textureQuality.value = 'medium';
        if (pixelRatio) {
          pixelRatio.value = '1.0';
          document.getElementById('pixel-ratio-value')!.textContent = '1.0';
        }
        break;
      case 'high':
        if (shadowsToggle) shadowsToggle.checked = true;
        if (aaToggle) aaToggle.checked = true;
        if (renderDistance) {
          renderDistance.value = '5';
          document.getElementById('render-distance-value')!.textContent = '5';
        }
        if (textureQuality) textureQuality.value = 'high';
        if (pixelRatio) {
          pixelRatio.value = '1.5';
          document.getElementById('pixel-ratio-value')!.textContent = '1.5';
        }
        break;
      case 'ultra':
        if (shadowsToggle) shadowsToggle.checked = true;
        if (aaToggle) aaToggle.checked = true;
        if (renderDistance) {
          renderDistance.value = '8';
          document.getElementById('render-distance-value')!.textContent = '8';
        }
        if (textureQuality) textureQuality.value = 'high';
        if (pixelRatio) {
          pixelRatio.value = '2.0';
          document.getElementById('pixel-ratio-value')!.textContent = '2.0';
        }
        break;
    }
  }

  private loadCurrentSettings() {
    // Load from localStorage or use defaults
    try {
      const saved = localStorage.getItem('graphics_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        this.applySettingsToUI(settings);
      }
    } catch (e) {
      console.warn('Could not load settings:', e);
    }
  }

  private applySettingsToUI(settings: any) {
    const qualityPreset = document.getElementById('quality-preset') as HTMLSelectElement;
    const shadowsToggle = document.getElementById('shadows-toggle') as HTMLInputElement;
    const aaToggle = document.getElementById('antialiasing-toggle') as HTMLInputElement;
    const renderDistance = document.getElementById('render-distance') as HTMLInputElement;
    const textureQuality = document.getElementById('texture-quality') as HTMLSelectElement;
    const pixelRatio = document.getElementById('pixel-ratio') as HTMLInputElement;
    const targetFps = document.getElementById('target-fps') as HTMLSelectElement;

    if (settings.quality && qualityPreset) qualityPreset.value = settings.quality;
    if (settings.shadows !== undefined && shadowsToggle) shadowsToggle.checked = settings.shadows;
    if (settings.antialiasing !== undefined && aaToggle) aaToggle.checked = settings.antialiasing;
    if (settings.renderDistance && renderDistance) {
      renderDistance.value = settings.renderDistance.toString();
      document.getElementById('render-distance-value')!.textContent = settings.renderDistance.toString();
    }
    if (settings.textureQuality && textureQuality) textureQuality.value = settings.textureQuality;
    if (settings.pixelRatio && pixelRatio) {
      pixelRatio.value = settings.pixelRatio.toString();
      document.getElementById('pixel-ratio-value')!.textContent = settings.pixelRatio.toFixed(1);
    }
    if (settings.targetFPS && targetFps) targetFps.value = settings.targetFPS.toString();
  }

  private applySettings() {
    const settings = {
      quality: (document.getElementById('quality-preset') as HTMLSelectElement).value,
      shadows: (document.getElementById('shadows-toggle') as HTMLInputElement).checked,
      antialiasing: (document.getElementById('antialiasing-toggle') as HTMLInputElement).checked,
      renderDistance: parseInt((document.getElementById('render-distance') as HTMLInputElement).value),
      textureQuality: (document.getElementById('texture-quality') as HTMLSelectElement).value,
      pixelRatio: parseFloat((document.getElementById('pixel-ratio') as HTMLInputElement).value),
      targetFPS: parseInt((document.getElementById('target-fps') as HTMLSelectElement).value),
      vsync: (document.getElementById('vsync-toggle') as HTMLInputElement).checked,
      gpuInstancing: (document.getElementById('gpu-instancing-toggle') as HTMLInputElement).checked,
      frustumCulling: (document.getElementById('frustum-culling-toggle') as HTMLInputElement).checked,
    };

    // Save to localStorage
    localStorage.setItem('graphics_settings', JSON.stringify(settings));

    // Callback to game engine
    if (this.onApplyCallback) {
      this.onApplyCallback(settings);
    }

    // Show confirmation
    alert('Settings applied! Changes will take effect immediately.');
    this.hide();
  }

  public show() {
    if (this.menuElement) {
      this.menuElement.style.display = 'block';
      this.isVisible = true;
      this.loadCurrentSettings();
    }
  }

  public hide() {
    if (this.menuElement) {
      this.menuElement.style.display = 'none';
      this.isVisible = false;
    }
  }

  public toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  public onApply(callback: (settings: any) => void) {
    this.onApplyCallback = callback;
  }

  public isOpen(): boolean {
    return this.isVisible;
  }
}
