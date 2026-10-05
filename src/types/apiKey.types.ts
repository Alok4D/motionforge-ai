export interface GeminiApiKey {
  key: string;
  label?: string;
  isActive: boolean;
  isExhaustedToday: boolean;
  exhaustedTimestamp?: number;
  requestCount: number;
  lastUsedTimestamp?: number;
}

export interface ApiKeyPoolState {
  keys: GeminiApiKey[];
  currentIndex: number;
  totalActive: number;
  totalExhausted: number;
}
