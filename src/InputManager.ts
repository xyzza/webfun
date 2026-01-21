export class InputManager {
  private keys: Map<string, boolean> = new Map();

  // Store bound handlers for cleanup
  private handleKeyDownBound: (e: KeyboardEvent) => void;
  private handleKeyUpBound: (e: KeyboardEvent) => void;
  private buttonHandlers: Map<Element, { start: EventListener; end: EventListener }> = new Map();

  constructor() {
    // Bind keyboard handlers
    this.handleKeyDownBound = (e: KeyboardEvent) => {
      this.keys.set(e.key, true);
    };

    this.handleKeyUpBound = (e: KeyboardEvent) => {
      this.keys.set(e.key, false);
    };

    // Add keyboard listeners
    window.addEventListener('keydown', this.handleKeyDownBound);
    window.addEventListener('keyup', this.handleKeyUpBound);

    // Setup touch button listeners
    this.setupTouchButtons();
  }

  private setupTouchButtons(): void {
    const buttons = document.querySelectorAll('.touch-btn');

    buttons.forEach((button) => {
      const action = button.getAttribute('data-action');
      if (!action) return;

      const startHandler = (e: Event) => {
        e.preventDefault();
        this.setButtonState(action, true);
        button.classList.add('pressed');
      };

      const endHandler = (e: Event) => {
        e.preventDefault();
        this.setButtonState(action, false);
        button.classList.remove('pressed');
      };

      // Touch events
      button.addEventListener('touchstart', startHandler, { passive: false });
      button.addEventListener('touchend', endHandler, { passive: false });
      button.addEventListener('touchcancel', endHandler, { passive: false });

      // Mouse events (for testing on desktop)
      button.addEventListener('mousedown', startHandler);
      button.addEventListener('mouseup', endHandler);
      button.addEventListener('mouseleave', endHandler);

      // Store handlers for cleanup
      this.buttonHandlers.set(button, { start: startHandler, end: endHandler });
    });
  }

  private setButtonState(action: string, pressed: boolean): void {
    switch (action) {
      case 'left':
        this.keys.set('ArrowLeft', pressed);
        break;
      case 'right':
        this.keys.set('ArrowRight', pressed);
        break;
      case 'jump':
        this.keys.set('ArrowUp', pressed);
        break;
    }
  }

  // Cleanup method to remove all event listeners
  destroy(): void {
    // Remove keyboard listeners
    window.removeEventListener('keydown', this.handleKeyDownBound);
    window.removeEventListener('keyup', this.handleKeyUpBound);

    // Remove button listeners
    this.buttonHandlers.forEach((handlers, button) => {
      button.removeEventListener('touchstart', handlers.start);
      button.removeEventListener('touchend', handlers.end);
      button.removeEventListener('touchcancel', handlers.end);
      button.removeEventListener('mousedown', handlers.start);
      button.removeEventListener('mouseup', handlers.end);
      button.removeEventListener('mouseleave', handlers.end);
    });
    this.buttonHandlers.clear();
  }

  isKeyPressed(key: string): boolean {
    return this.keys.get(key) || false;
  }

  isLeftPressed(): boolean {
    return this.isKeyPressed('ArrowLeft') || this.isKeyPressed('a');
  }

  isRightPressed(): boolean {
    return this.isKeyPressed('ArrowRight') || this.isKeyPressed('d');
  }

  isJumpPressed(): boolean {
    return this.isKeyPressed('ArrowUp') || this.isKeyPressed('w') || this.isKeyPressed(' ');
  }

  isDownPressed(): boolean {
    return this.isKeyPressed('ArrowDown') || this.isKeyPressed('s');
  }

  isPausePressed(): boolean {
    return this.isKeyPressed('Escape') || this.isKeyPressed('p');
  }
}
