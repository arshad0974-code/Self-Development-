import { HabitCompletions } from '../types';

/**
 * Returns YYYY-MM-DD format using LOCAL user timezone
 * Strictly prevents UTC shifting bugs where late evening becomes next day.
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // midday avoids any DST edge issues
}

export function formatDateDisplay(dateStr: string): string {
  const d = parseLocalDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const d = parseLocalDateString(dateStr);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDayOfWeek(dateStr: string): string {
  const d = parseLocalDateString(dateStr);
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Quiet Hours & Focus';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Returns an array of date strings for the past N days up to referenceDate (inclusive).
 * Index 0 is the oldest date, index N-1 is referenceDate.
 */
export function getPastDates(count: number = 30, referenceDateStr?: string): string[] {
  const refDate = referenceDateStr ? parseLocalDateString(referenceDateStr) : new Date();
  const dates: string[] = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - i, 12, 0, 0);
    dates.push(getLocalDateString(d));
  }
  
  return dates;
}

/**
 * Shifts a YYYY-MM-DD date by offset days
 */
export function shiftDate(dateStr: string, offsetDays: number): string {
  const d = parseLocalDateString(dateStr);
  d.setDate(d.getDate() + offsetDays);
  return getLocalDateString(d);
}

/**
 * Calculate current consecutive streak and total days with >= 1 habit completed
 */
export function calculateHabitStats(completions: HabitCompletions) {
  const todayStr = getLocalDateString();
  const yesterdayStr = shiftDate(todayStr, -1);
  
  // Find all dates with at least one completed habit
  const completedDatesSet = new Set<string>();
  for (const [date, habitMap] of Object.entries(completions)) {
    const hasAnyCompleted = Object.values(habitMap).some(Boolean);
    if (hasAnyCompleted) {
      completedDatesSet.add(date);
    }
  }

  const totalActiveDays = completedDatesSet.size;

  // Calculate streak starting from today if completed, or yesterday if today not yet completed
  let currentStreak = 0;
  let checkDate = todayStr;

  if (!completedDatesSet.has(todayStr)) {
    // If today hasn't been completed yet, streak can still be maintained if yesterday was completed
    if (completedDatesSet.has(yesterdayStr)) {
      checkDate = yesterdayStr;
    } else {
      return { currentStreak: 0, totalActiveDays, bestStreak: calculateBestStreak(completedDatesSet) };
    }
  }

  // Count backwards day by day
  while (completedDatesSet.has(checkDate)) {
    currentStreak++;
    checkDate = shiftDate(checkDate, -1);
  }

  const bestStreak = Math.max(currentStreak, calculateBestStreak(completedDatesSet));

  return {
    currentStreak,
    totalActiveDays,
    bestStreak,
  };
}

function calculateBestStreak(completedDatesSet: Set<string>): number {
  if (completedDatesSet.size === 0) return 0;
  const sortedDates = Array.from(completedDatesSet).sort();
  let maxStreak = 0;
  let currentRun = 0;
  let prevDate: string | null = null;

  for (const date of sortedDates) {
    if (!prevDate) {
      currentRun = 1;
    } else {
      const expectedNext = shiftDate(prevDate, 1);
      if (date === expectedNext) {
        currentRun++;
      } else {
        currentRun = 1;
      }
    }
    if (currentRun > maxStreak) {
      maxStreak = currentRun;
    }
    prevDate = date;
  }

  return maxStreak;
}
