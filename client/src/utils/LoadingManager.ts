/**
 * LoadingManager - Manages progressive loading to prevent lag
 */
export class LoadingManager {
  private loadingScreen: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private currentProgress: number = 0;
  
  constructor() {
    this.createLoadingScreen();
  }
  
  private createLoadingScreen(): void {
    this.loadingScreen = document.createElement('div');
    this.loadingScreen.id = 'loading-screen';
    this.loadingScreen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: Arial, sans-serif;
      color: white;
    `;
    
    // Title
    const title = document.createElement('h1');
    title.textContent = '🎮 Fantasy Survival MMO';
    title.style.cssText = `
      font-size: 48px;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    `;
    this.loadingScreen.appendChild(title);
    
    // Status text
    this.statusText = document.createElement('div');
    this.statusText.textContent = 'Initializing...';
    this.statusText.style.cssText = `
      font-size: 18px;
      margin-bottom: 20px;
      color: #88ccff;
    `;
    this.loadingScreen.appendChild(this.statusText);
    
    // Progress bar container
    const progressContainer = document.createElement('div');
    progressContainer.style.cssText = `
      width: 400px;
      height: 30px;
      background: rgba(0,0,0,0.3);
      border-radius: 15px;
      overflow: hidden;
      border: 2px solid #4a5568;
    `;
    
    // Progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
      transition: width 0.3s ease;
    `;
    progressContainer.appendChild(this.progressBar);
    this.loadingScreen.appendChild(progressContainer);
    
    // Progress percentage
    const percentage = document.createElement('div');
    percentage.id = 'loading-percentage';
    percentage.textContent = '0%';
    percentage.style.cssText = `
      font-size: 24px;
      margin-top: 15px;
      font-weight: bold;
    `;
    this.loadingScreen.appendChild(percentage);
    
    document.body.appendChild(this.loadingScreen);
  }
  
  public updateProgress(progress: number, status: string): void {
    this.currentProgress = Math.min(progress, 100);
    
    if (this.progressBar) {
      this.progressBar.style.width = `${this.currentProgress}%`;
    }
    
    if (this.statusText) {
      this.statusText.textContent = status;
    }
    
    const percentage = document.getElementById('loading-percentage');
    if (percentage) {
      percentage.textContent = `${Math.round(this.currentProgress)}%`;
    }
  }
  
  public complete(): void {
    this.updateProgress(100, 'Ready!');
    
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.style.opacity = '0';
        this.loadingScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
          this.loadingScreen?.remove();
        }, 500);
      }
    }, 500);
  }
  
  public showError(message: string): void {
    if (this.loadingScreen) {
      this.loadingScreen.innerHTML = `
        <div style="text-align: center; padding: 20px; max-width: 600px;">
          <h1 style="color: #ff4444; margin-bottom: 20px;">⚠️ Loading Error</h1>
          <p style="font-size: 18px; margin-bottom: 20px;">${message}</p>
          <button onclick="location.reload()" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 18px;
            border-radius: 5px;
            cursor: pointer;
          ">Reload Game</button>
        </div>
      `;
    }
  }
}
