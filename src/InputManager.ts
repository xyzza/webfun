export class InputManager {
  private keys: Map<string, boolean> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.set(e.key, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.set(e.key, false);
    });
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
