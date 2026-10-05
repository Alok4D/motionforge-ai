import { GeminiApiKey, ApiKeyPoolState } from '../../types/apiKey.types';

const STORAGE_KEY = 'motion_hero_gemini_keys';

export class KeyRotator {
  private state: ApiKeyPoolState = {
    keys: [],
    currentIndex: 0,
    totalActive: 0,
    totalExhausted: 0,
  };

  constructor() {
    this.loadFromStorage();
  }

  public loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedKeys: GeminiApiKey[] = JSON.parse(saved);
        this.state.keys = parsedKeys;
        this.updateStats();
      }
    } catch (err) {
      console.error('Failed to load keys from storage', err);
    }
  }

  public saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.keys));
      this.updateStats();
    } catch (err) {
      console.error('Failed to save keys to storage', err);
    }
  }

  public addKeys(rawKeys: string[]): number {
    let addedCount = 0;
    const existing = new Set(this.state.keys.map(k => k.key.trim()));

    rawKeys.forEach(rawKey => {
      const cleanKey = rawKey.trim();
      if (cleanKey.length > 20 && !existing.has(cleanKey)) {
        this.state.keys.push({
          key: cleanKey,
          isActive: true,
          isExhaustedToday: false,
          requestCount: 0,
        });
        existing.add(cleanKey);
        addedCount++;
      }
    });

    this.saveToStorage();
    return addedCount;
  }

  public removeKey(keyToRemove: string): void {
    this.state.keys = this.state.keys.filter(k => k.key !== keyToRemove);
    this.saveToStorage();
  }

  public clearAll(): void {
    this.state.keys = [];
    this.state.currentIndex = 0;
    this.saveToStorage();
  }

  public resetLimits(): void {
    this.state.keys.forEach(k => {
      k.isActive = true;
      k.isExhaustedToday = false;
      k.exhaustedTimestamp = undefined;
    });
    this.saveToStorage();
  }

  public getNextActiveKey(): GeminiApiKey | null {
    if (this.state.keys.length === 0) return null;

    const activeKeys = this.state.keys.filter(k => k.isActive && !k.isExhaustedToday);
    if (activeKeys.length === 0) return null;

    // Pick next in rotation
    this.state.currentIndex = (this.state.currentIndex + 1) % activeKeys.length;
    const selected = activeKeys[this.state.currentIndex];
    selected.requestCount = (selected.requestCount || 0) + 1;
    selected.lastUsedTimestamp = Date.now();
    this.saveToStorage();

    return selected;
  }

  public markKeyExhausted(exhaustedKeyStr: string): void {
    const target = this.state.keys.find(k => k.key === exhaustedKeyStr);
    if (target) {
      target.isActive = false;
      target.isExhaustedToday = true;
      target.exhaustedTimestamp = Date.now();
      this.saveToStorage();
    }
  }

  public getState(): ApiKeyPoolState {
    this.updateStats();
    return { ...this.state };
  }

  private updateStats(): void {
    this.state.totalActive = this.state.keys.filter(k => k.isActive && !k.isExhaustedToday).length;
    this.state.totalExhausted = this.state.keys.filter(k => k.isExhaustedToday || !k.isActive).length;
  }
}

export const keyRotator = new KeyRotator();
