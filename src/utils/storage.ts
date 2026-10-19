import {
  Habit,
  HabitCompletions,
  JournalEntry,
  ConfidenceRating,
  SkillUserNote,
  UserSettings,
  ExportDataPayload,
} from '../types';
import { DEFAULT_HABITS } from '../data/defaultHabits';

const KEYS = {
  HABITS: 'bvom_habits_v1',
  COMPLETIONS: 'bvom_completions_v1',
  JOURNAL: 'bvom_journal_v1',
  RATINGS: 'bvom_ratings_v1',
  SKILLS: 'bvom_skills_v1',
  SETTINGS: 'bvom_settings_v1',
};

const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  userName: 'Self-Seeker',
};

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch (err) {
    console.warn(`[storage] Failed to parse key "${key}", using fallback`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] Failed to save key "${key}"`, err);
    return false;
  }
}

export function loadHabits(): Habit[] {
  const loaded = safeGetItem<Habit[]>(KEYS.HABITS, []);
  if (!loaded || !Array.isArray(loaded) || loaded.length === 0) {
    safeSetItem(KEYS.HABITS, DEFAULT_HABITS);
    return DEFAULT_HABITS;
  }
  return loaded;
}

export function saveHabits(habits: Habit[]): void {
  safeSetItem(KEYS.HABITS, habits);
}

export function loadCompletions(): HabitCompletions {
  return safeGetItem<HabitCompletions>(KEYS.COMPLETIONS, {});
}

export function saveCompletions(completions: HabitCompletions): void {
  safeSetItem(KEYS.COMPLETIONS, completions);
}

export function loadJournalEntries(): Record<string, JournalEntry> {
  return safeGetItem<Record<string, JournalEntry>>(KEYS.JOURNAL, {});
}

export function saveJournalEntries(entries: Record<string, JournalEntry>): void {
  safeSetItem(KEYS.JOURNAL, entries);
}

export function loadRatings(): Record<string, ConfidenceRating> {
  return safeGetItem<Record<string, ConfidenceRating>>(KEYS.RATINGS, {});
}

export function saveRatings(ratings: Record<string, ConfidenceRating>): void {
  safeSetItem(KEYS.RATINGS, ratings);
}

export function loadSkillNotes(): Record<number, SkillUserNote> {
  return safeGetItem<Record<number, SkillUserNote>>(KEYS.SKILLS, {});
}

export function saveSkillNotes(notes: Record<number, SkillUserNote>): void {
  safeSetItem(KEYS.SKILLS, notes);
}

export function loadSettings(): UserSettings {
  return safeGetItem<UserSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: UserSettings): void {
  safeSetItem(KEYS.SETTINGS, settings);
}

/**
 * Exports all application data into a single downloadable JSON
 */
export function exportAllData(): string {
  const payload: ExportDataPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    habits: loadHabits(),
    completions: loadCompletions(),
    journalEntries: loadJournalEntries(),
    ratings: loadRatings(),
    skillNotes: loadSkillNotes(),
    settings: loadSettings(),
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `better-version-of-me-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return jsonString;
}

/**
 * Validates and imports JSON payload
 */
export function importDataFromJson(jsonStr: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonStr) as Partial<ExportDataPayload>;
    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Invalid JSON file format.' };
    }

    if (Array.isArray(data.habits)) {
      saveHabits(data.habits);
    }
    if (data.completions && typeof data.completions === 'object') {
      saveCompletions(data.completions);
    }
    if (data.journalEntries && typeof data.journalEntries === 'object') {
      saveJournalEntries(data.journalEntries);
    }
    if (data.ratings && typeof data.ratings === 'object') {
      saveRatings(data.ratings);
    }
    if (data.skillNotes && typeof data.skillNotes === 'object') {
      saveSkillNotes(data.skillNotes);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveSettings({ ...DEFAULT_SETTINGS, ...data.settings });
    }

    return { success: true, message: 'Data imported successfully!' };
  } catch (err: unknown) {
    const errMessage = err instanceof Error ? err.message : 'Unknown parsing error';
    return { success: false, message: `Failed to import JSON: ${errMessage}` };
  }
}

/**
 * Resets all user data back to fresh defaults
 */
export function clearAllData(): void {
  localStorage.removeItem(KEYS.HABITS);
  localStorage.removeItem(KEYS.COMPLETIONS);
  localStorage.removeItem(KEYS.JOURNAL);
  localStorage.removeItem(KEYS.RATINGS);
  localStorage.removeItem(KEYS.SKILLS);
  localStorage.removeItem(KEYS.SETTINGS);

  // Re-seed default habits
  safeSetItem(KEYS.HABITS, DEFAULT_HABITS);
  safeSetItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
}
