export interface Habit {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO date
  archived?: boolean;
}

// Map of date string "YYYY-MM-DD" -> { [habitId: string]: boolean }
export type HabitCompletions = Record<string, Record<string, boolean>>;

export interface JournalEntry {
  date: string; // "YYYY-MM-DD"
  whatWentWell: string;
  mistakeMade: string;
  whyHappened: string;
  whatLearned: string;
  whatDoDifferently: string;
  updatedAt: string;
}

export interface ConfidenceRating {
  date: string; // "YYYY-MM-DD"
  confidence: number; // 1-10
  communication: number; // 1-10
  emotionalControl: number; // 1-10
  decisionMaking: number; // 1-10
  consistency: number; // 1-10
  notes?: string;
  updatedAt: string;
}

export interface SkillItem {
  id: number;
  title: string;
  category: 'Communication' | 'Mindset' | 'Emotional Mastery' | 'Discipline & Habits' | 'Life Design';
  description: string;
  exercise: string;
  keyTakeaway: string;
}

export interface SkillUserNote {
  skillId: number;
  isFocused?: boolean;
  personalNotes?: string;
  completedExerciseDates?: string[]; // YYYY-MM-DD
}

export interface UserSettings {
  soundEnabled: boolean;
  userName: string;
}

export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  habits: Habit[];
  completions: HabitCompletions;
  journalEntries: Record<string, JournalEntry>;
  ratings: Record<string, ConfidenceRating>;
  skillNotes: Record<number, SkillUserNote>;
  settings: UserSettings;
}
