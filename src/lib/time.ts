export const MS_PER_SEC = 1000;
export const MS_PER_MIN = 60_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_DAY = 86_400_000;

export const OFFLINE_CAP_FREE_MS = 8 * MS_PER_HOUR;
export const OFFLINE_CAP_VIP_MS = 24 * MS_PER_HOUR;

export function formatDuration(ms: number): string {
  if (ms < MS_PER_MIN) return `${Math.floor(ms / MS_PER_SEC)}s`;
  if (ms < MS_PER_HOUR) {
    const m = Math.floor(ms / MS_PER_MIN);
    const s = Math.floor((ms % MS_PER_MIN) / MS_PER_SEC);
    return `${m}m ${s}s`;
  }
  if (ms < MS_PER_DAY) {
    const h = Math.floor(ms / MS_PER_HOUR);
    const m = Math.floor((ms % MS_PER_HOUR) / MS_PER_MIN);
    return `${h}h ${m}m`;
  }
  const d = Math.floor(ms / MS_PER_DAY);
  const h = Math.floor((ms % MS_PER_DAY) / MS_PER_HOUR);
  return `${d}d ${h}h`;
}

export function now(): number {
  return Date.now();
}
