import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, INITIAL_STATE } from './types';

const KEY = 'empirestate.state.v1';

export async function loadState(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...INITIAL_STATE, installedAt: Date.now(), lastTickAt: Date.now() };
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return { ...INITIAL_STATE, ...parsed };
  } catch {
    return { ...INITIAL_STATE, installedAt: Date.now(), lastTickAt: Date.now() };
  }
}

export async function saveState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export async function resetState(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
