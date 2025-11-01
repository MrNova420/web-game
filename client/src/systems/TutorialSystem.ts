/**
 * Tutorial step definition
 */
export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  trigger: 'manual' | 'auto';
  condition?: () => boolean;
  completed: boolean;
}

/**
 * TutorialSystem - Guides new players through game mechanics
 */
export class TutorialSystem {
  private steps: TutorialStep[] = [];
  private currentStep = 0;
  private enabled = true;
  private tutorialContainer: HTMLElement | null = null;

  constructor() {
    this.initializeTutorial();
    this.createTutorialUI();
    console.log('TutorialSystem initialized');
  }

  /**
   * Initialize tutorial steps
   */
  private initializeTutorial() {
    this.steps = [
      {
        id: 'welcome',
        title: 'Welcome to Fantasy MMO!',
        description: 'Use WASD keys to move your character around the world.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'look_around',
        title: 'Look Around',
        description: 'Hold Right Mouse Button and move the mouse to rotate the camera.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'gather_resource',
        title: 'Gather Resources',
        description: 'Walk up to a tree or rock and press E to gather resources.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'open_inventory',
        title: 'Check Inventory',
        description: 'Press I to open your inventory and see collected items.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'combat',
        title: 'Combat Basics',
        description: 'Click on an enemy to attack. Watch your health bar!',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'crafting',
        title: 'Crafting',
        description: 'Find a workbench or anvil to craft items. Press C near one.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'quests',
        title: 'Quests',
        description: 'Talk to NPCs (yellow dots on minimap) to receive quests. Press Q to view.',
        trigger: 'auto',
        completed: false
      },
      {
        id: 'level_up',
        title: 'Level Up',
        description: 'Gain experience by defeating enemies and completing quests to level up!',
        trigger: 'auto',
        completed: false
      }
    ];
  }

  /**
   * Create tutorial UI overlay
   */
  private createTutorialUI() {
    this.tutorialContainer = document.createElement('div');
    this.tutorialContainer.id = 'tutorial-container';
    this.tutorialContainer.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      width: 400px;
      padding: 20px;
      background: rgba(0, 0, 0, 0.9);
      border: 3px solid #ffd700;
      border-radius: 10px;
      color: white;
      font-family: Arial, sans-serif;
      z-index: 2000;
      display: none;
    `;

    this.tutorialContainer.innerHTML = `
      <h3 id="tutorial-title" style="margin: 0 0 10px 0; color: #ffd700;"></h3>
      <p id="tutorial-description" style="margin: 0 0 15px 0;"></p>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span id="tutorial-progress" style="color: #aaa; font-size: 14px;"></span>
        <div>
          <button id="tutorial-skip" style="
            padding: 8px 15px;
            margin-right: 10px;
            background: #666;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
          ">Skip Tutorial</button>
          <button id="tutorial-next" style="
            padding: 8px 15px;
            background: #ffd700;
            border: none;
            border-radius: 5px;
            color: black;
            font-weight: bold;
            cursor: pointer;
          ">Next</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.tutorialContainer);

    // Add event listeners
    document.getElementById('tutorial-next')?.addEventListener('click', () => {
      this.nextStep();
    });

    document.getElementById('tutorial-skip')?.addEventListener('click', () => {
      this.skipTutorial();
    });
  }

  /**
   * Start tutorial
   */
  start() {
    if (!this.enabled || this.steps.length === 0) return;

    this.currentStep = 0;
    this.showCurrentStep();
  }

  /**
   * Show current step
   */
  private showCurrentStep() {
    if (!this.tutorialContainer || this.currentStep >= this.steps.length) {
      this.completeTutorial();
      return;
    }

    const step = this.steps[this.currentStep];
    const titleEl = document.getElementById('tutorial-title');
    const descEl = document.getElementById('tutorial-description');
    const progressEl = document.getElementById('tutorial-progress');

    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.textContent = step.description;
    if (progressEl) progressEl.textContent = `Step ${this.currentStep + 1} of ${this.steps.length}`;

    this.tutorialContainer.style.display = 'block';
  }

  /**
   * Move to next step
   */
  nextStep() {
    if (this.currentStep < this.steps.length) {
      this.steps[this.currentStep].completed = true;
      this.currentStep++;
      this.showCurrentStep();
    }
  }

  /**
   * Complete specific step by ID
   */
  completeStep(stepId: string) {
    const stepIndex = this.steps.findIndex(s => s.id === stepId);
    if (stepIndex !== -1 && stepIndex === this.currentStep) {
      this.nextStep();
    }
  }

  /**
   * Skip entire tutorial
   */
  skipTutorial() {
    if (this.tutorialContainer) {
      this.tutorialContainer.style.display = 'none';
    }
    this.enabled = false;
    console.log('Tutorial skipped');
  }

  /**
   * Complete tutorial
   */
  private completeTutorial() {
    if (this.tutorialContainer) {
      this.tutorialContainer.innerHTML = `
        <h3 style="margin: 0 0 10px 0; color: #ffd700;">Tutorial Complete!</h3>
        <p style="margin: 0 0 15px 0;">You've learned the basics. Good luck on your adventure!</p>
        <button id="tutorial-close" style="
          padding: 10px 20px;
          background: #ffd700;
          border: none;
          border-radius: 5px;
          color: black;
          font-weight: bold;
          cursor: pointer;
          width: 100%;
        ">Close</button>
      `;

      document.getElementById('tutorial-close')?.addEventListener('click', () => {
        if (this.tutorialContainer) {
          this.tutorialContainer.style.display = 'none';
        }
      });
    }

    console.log('Tutorial completed!');
  }

  /**
   * Check if tutorial is active
   */
  isActive(): boolean {
    return this.enabled && this.currentStep < this.steps.length;
  }

  /**
   * Get current step
   */
  getCurrentStep(): TutorialStep | null {
    if (this.currentStep < this.steps.length) {
      return this.steps[this.currentStep];
    }
    return null;
  }

  /**
   * Reset tutorial
   */
  reset() {
    this.currentStep = 0;
    this.enabled = true;
    this.steps.forEach(step => step.completed = false);
  }

  /**
   * Dispose
   */
  dispose() {
    if (this.tutorialContainer) {
      document.body.removeChild(this.tutorialContainer);
    }
  }
}
