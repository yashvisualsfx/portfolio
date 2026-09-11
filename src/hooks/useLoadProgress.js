import { useSyncExternalStore } from 'react';
import { getProgress, subscribe } from '../animations/loader-registry';

/** Live boot progress, 0 → 1. */
export function useLoadProgress() {
  return useSyncExternalStore(subscribe, getProgress, () => 0);
}
