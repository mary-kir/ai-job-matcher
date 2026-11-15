import { emptyStatus } from '../tracking.js';

export const STORAGE_KEY = 'ai-job-matcher:statuses:v1';

// This boundary can later be replaced with a backend repository.
// Whitelist status fields: never persist CVs, descriptions, secrets or arbitrary objects.
export function normalizeStatuses(jobs, raw = {}) {
  return Object.fromEntries(jobs.map(({ id }) => {
    const value = raw?.[id];
    const applied = value?.applied === true;
    const rejected = !applied && value?.rejected === true;
    return [id, {
      ...emptyStatus(), applied, rejected,
      saved: !rejected && value?.saved === true,
      applied_at: applied && typeof value?.applied_at === 'string' && Number.isFinite(Date.parse(value.applied_at)) ? value.applied_at : null,
    }];
  }));
}

export function loadStatuses(jobs, storage) {
  try {
    const raw = JSON.parse(storage.getItem(STORAGE_KEY));
    if (raw && raw.version !== 1) throw new Error('Unsupported storage version');
    return { statuses: normalizeStatuses(jobs, raw?.statuses), warning: '' };
  } catch {
    return { statuses: normalizeStatuses(jobs), warning: 'Saved browser data could not be loaded. Changes may only last for this visit.' };
  }
}

export function saveStatuses(jobs, statuses, storage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, statuses: normalizeStatuses(jobs, statuses) }));
    return '';
  } catch {
    return 'Browser storage is unavailable or full. Your latest changes are only kept for this visit.';
  }
}

// Access can itself throw when browser storage is blocked.
export const browserStorage = {
  getItem: key => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
};
