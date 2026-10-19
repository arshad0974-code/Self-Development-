import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Flame, 
  Calendar, 
  Plus, 
  Pencil, 
  Trash2, 
  RotateCcw, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertCircle,
  BookMarked,
  Sliders,
  ArrowRight
} from 'lucide-react';
import { Habit, HabitCompletions, UserSettings, JournalEntry, ConfidenceRating } from '../types';
import { 
  getLocalDateString, 
  formatDateDisplay, 
  getPastDates, 
  getGreeting, 
  shiftDate,
  formatShortDate,
  formatDayOfWeek,
  calculateHabitStats 
} from '../utils/dateUtils';
import { playCompletionChime, playAllCompletedCelebration } from '../utils/sound';

interface DashboardViewProps {
  habits: Habit[];
  completions: HabitCompletions;
  journalEntries: Record<string, JournalEntry>;
  ratings: Record<string, ConfidenceRating>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onToggleHabit: (habitId: string, date: string) => void;
  onAddHabit: (title: string, description: string) => void;
  onEditHabit: (habitId: string, newTitle: string, newDescription: string) => void;
  onDeleteHabit: (habitId: string) => void;
  onResetDayCompletions: (date: string) => void;
  onRestoreDefaultHabits: () => void;
  onNavigateToTab: (tab: 'dashboard' | 'skills' | 'journal' | 'progress' | 'settings') => void;
  settings: UserSettings;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  habits,
  completions,
  journalEntries,
  ratings,
  selectedDate,
  onSelectDate,
  onToggleHabit,
  onAddHabit,
  onEditHabit,
  onDeleteHabit,
  onResetDayCompletions,
  onRestoreDefaultHabits,
  onNavigateToTab,
  settings,
}) => {
  const todayStr = getLocalDateString();
  const isToday = selectedDate === todayStr;

  // Active (non-archived) habits
  const activeHabits = habits.filter(h => !h.archived);

  // Completions for currently selected date
  const dayCompletions = completions[selectedDate] || {};
  const completedCount = activeHabits.filter(h => dayCompletions[h.id]).length;
  const totalCount = activeHabits.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  // Stats calculation
  const stats = calculateHabitStats(completions);

  // 30-day date strip
  const past30Days = getPastDates(30, todayStr);

  // Modal / dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [deletingHabitId, setDeletingHabitId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (habitId: string) => {
    const isCurrentlyDone = !!dayCompletions[habitId];
    onToggleHabit(habitId, selectedDate);

    if (!isCurrentlyDone && settings.soundEnabled) {
      if (completedCount + 1 === totalCount) {
        playAllCompletedCelebration();
      } else {
        playCompletionChime();
      }
    }
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddHabit(newTitle.trim(), newDesc.trim());
    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  const handleStartEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditTitle(habit.title);
    setEditDesc(habit.description || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabit || !editTitle.trim()) return;
    onEditHabit(editingHabit.id, editTitle.trim(), editDesc.trim());
    setEditingHabit(null);
  };

  const confirmDelete = () => {
    if (deletingHabitId) {
      onDeleteHabit(deletingHabitId);
      setDeletingHabitId(null);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Hero Greeting & Overview */}
      <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{getGreeting()}</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 font-normal">{settings.userName}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              {formatDateDisplay(selectedDate)}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-md">
              Small disciplines repeated daily create exponential personal evolution.
            </p>
          </div>

          {/* Quick Date Switcher Controls */}
          <div className="flex items-center gap-1.5 self-start sm:self-center bg-[#070d1e]/80 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectDate(shiftDate(selectedDate, -1))}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Previous day"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectDate(todayStr)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isToday 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onSelectDate(shiftDate(selectedDate, 1))}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Next day"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Real Progress Bar & Key KPIs */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Completion Rate */}
          <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
            <span className="text-xs text-slate-400 block">Day Completion</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-amber-300 tabular-nums">
                {percentage}%
              </span>
              <span className="text-xs text-slate-400 tabular-nums">
                ({completedCount}/{totalCount})
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-amber-400 to-teal-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Current Streak */}
          <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
            <span className="text-xs text-slate-400 block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Current Streak</span>
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {stats.currentStreak}
              </span>
              <span className="text-xs text-slate-400">
                {stats.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="text-[11px] text-amber-400/80 block mt-2">
              {stats.currentStreak > 0 ? 'Fire burning strong' : 'Begin streak today'}
            </span>
          </div>

          {/* Best Streak */}
          <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
            <span className="text-xs text-slate-400 block flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-teal-400" />
              <span>Best Streak</span>
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-white tabular-nums">
                {stats.bestStreak}
              </span>
              <span className="text-xs text-slate-400">
                {stats.bestStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-2">
              All-time record
            </span>
          </div>

          {/* Total Consistent Days */}
          <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
            <span className="text-xs text-slate-400 block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Total Active Days</span>
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-bold text-teal-300 tabular-nums">
                {stats.totalActiveDays}
              </span>
              <span className="text-xs text-slate-400">
                logged
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-2">
              With $\ge 1$ habit done
            </span>
          </div>
        </div>
      </section>

      {/* 30-Day Progress Horizon (Interactive mini calendar scroller) */}
      <section className="bg-[#0a1226] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              30-Day Consistency Horizon
            </h3>
            <p className="text-xs text-slate-400">
              Tap any date to review or edit its completed record
            </p>
          </div>
          <span className="text-xs text-amber-400 font-medium tabular-nums">
            Last 30 Days
          </span>
        </div>

        {/* Scrollable date strip */}
        <div className="flex gap-2 overflow-x-auto pb-2 pt-1 -mx-2 px-2 scrollbar-thin">
          {past30Days.map((dateStr) => {
            const isSelected = dateStr === selectedDate;
            const isCurrentDay = dateStr === todayStr;
            const dayMap = completions[dateStr] || {};
            const doneForDay = activeHabits.filter(h => dayMap[h.id]).length;
            const totalForDay = activeHabits.length;
            const isFullDay = totalForDay > 0 && doneForDay === totalForDay;
            const hasPartial = doneForDay > 0 && !isFullDay;

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`flex-shrink-0 flex flex-col items-center justify-between py-2 px-2.5 rounded-xl min-w-[50px] transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                    : isCurrentDay
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-[#060b18]/70 border-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200'
                }`}
                title={`${formatDateDisplay(dateStr)}: ${doneForDay}/${totalForDay} completed`}
              >
                <span className="text-[10px] uppercase font-semibold">
                  {formatDayOfWeek(dateStr)}
                </span>
                <span className="text-sm font-bold my-1 tabular-nums">
                  {dateStr.split('-')[2]}
                </span>
                {/* Visual completion dot */}
                <div className="h-1.5 flex items-center justify-center">
                  {isFullDay ? (
                    <span className="w-2 h-2 rounded-full bg-teal-400 shadow-sm" />
                  ) : hasPartial ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Daily Habits Checklist */}
      <section className="bg-[#0a1226] rounded-2xl p-4 sm:p-6 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Daily Habits Checklist
              </h3>
              {!isToday && (
                <span className="text-xs text-amber-300/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-medium">
                  Past / Future Date View
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Targeting the 5 daily foundational commitments for self-mastery.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset checkmarks for this specific day"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Day</span>
              </button>
            )}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add Custom Habit</span>
            </button>
          </div>
        </div>

        {/* 100% Complete Celebration Banner */}
        {isAllComplete && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-950/60 via-[#0e292c] to-teal-950/60 border border-teal-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center flex-shrink-0 text-teal-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-teal-200">
                All daily habits completed!
              </h4>
              <p className="text-xs text-teal-300/80 mt-0.5">
                Outstanding consistency. You kept every promise to yourself today.
              </p>
            </div>
          </div>
        )}

        {/* Habit List Rows */}
        <div className="mt-4 space-y-2.5">
          {activeHabits.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">No habits currently active.</p>
              <p className="text-xs text-slate-500 mt-1">
                You can restore the default 5 foundational habits or create your own custom habit.
              </p>
              <button
                onClick={onRestoreDefaultHabits}
                className="mt-4 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors"
              >
                Restore 5 Default Habits
              </button>
            </div>
          ) : (
            activeHabits.map((habit, index) => {
              const isChecked = !!dayCompletions[habit.id];

              return (
                <div
                  key={habit.id}
                  className={`group flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                    isChecked
                      ? 'bg-[#081224]/80 border-teal-500/30 shadow-inner'
                      : 'bg-[#080e1e]/90 border-white/5 hover:border-amber-500/30 hover:bg-[#0c152e]'
                  }`}
                >
                  {/* Left Hitbox & Checkbox */}
                  <button
                    onClick={() => handleToggle(habit.id)}
                    className="flex items-start sm:items-center gap-3.5 flex-1 text-left min-h-[44px] cursor-pointer"
                  >
                    <div className="mt-0.5 sm:mt-0 flex-shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-teal-400 fill-teal-500/20 transition-transform group-hover:scale-105" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400/70 tabular-nums">
                          0{index + 1}.
                        </span>
                        <h4
                          className={`text-sm sm:text-base font-semibold transition-colors ${
                            isChecked
                              ? 'text-slate-400 line-through decoration-teal-500/50'
                              : 'text-slate-100'
                          }`}
                        >
                          {habit.title}
                        </h4>
                      </div>
                      {habit.description && (
                        <p className={`text-xs mt-0.5 line-clamp-2 ${isChecked ? 'text-slate-500' : 'text-slate-400'}`}>
                          {habit.description}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => handleStartEdit(habit)}
                      className="p-2 text-slate-400 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Edit / Rename habit"
                      aria-label={`Edit habit ${habit.title}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingHabitId(habit.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                      title="Delete habit"
                      aria-label={`Delete habit ${habit.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Daily Reflection & Confidence Calibration Companion Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Reflection Companion Card */}
        {(() => {
          const entry = journalEntries[selectedDate];
          const hasReflection = entry && (entry.whatWentWell || entry.whatLearned || entry.whatDoDifferently);

          return (
            <div className="bg-[#0a1226] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Daily Reflection</span>
                  </span>
                  <span className={`text-[11px] font-medium ${hasReflection ? 'text-teal-300' : 'text-slate-500'}`}>
                    {hasReflection ? 'Completed' : 'Pending'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  5-Minute Evening Review
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {hasReflection 
                    ? (entry.whatLearned ? `Learned: ${entry.whatLearned}` : `What went well: ${entry.whatWentWell}`)
                    : 'Analyze wins, mistakes, and lessons for this day to compound wisdom.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('journal')}
                className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#0e1936] text-amber-300 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{hasReflection ? 'Review / Edit Journal' : 'Open Reflection Journal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}

        {/* Confidence Calibration Companion Card */}
        {(() => {
          const rating = ratings[selectedDate];
          const hasRating = !!rating;
          const avgScore = hasRating
            ? ((rating.confidence + rating.communication + rating.emotionalControl + rating.decisionMaking + rating.consistency) / 5).toFixed(1)
            : null;

          return (
            <div className="bg-[#0a1226] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-lg flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-teal-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>State Calibration</span>
                  </span>
                  <span className={`text-[11px] font-medium ${hasRating ? 'text-teal-300 font-bold' : 'text-slate-500'}`}>
                    {hasRating ? `Avg ${avgScore} / 10` : 'Not rated'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  1–10 Confidence & Mastery
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {hasRating 
                    ? `Confidence: ${rating.confidence}/10 · Emotion: ${rating.emotionalControl}/10 · Consistency: ${rating.consistency}/10`
                    : 'Rate subjective confidence, emotional control, and clarity for today.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('progress')}
                className="w-full py-2 px-3 bg-[#070d1e] hover:bg-[#0e1936] text-teal-300 border border-teal-500/20 hover:border-teal-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{hasRating ? 'Adjust Calibration' : 'Record Calibration (1–10)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()}
      </section>

      {/* Add Custom Habit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1226] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Add New Custom Habit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a daily habit you wish to build. Past logs will safely track this new habit.
            </p>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Read 1 chapter before bed"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#070d1e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Prompt (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Keep phone outside bedroom to maintain focus."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#070d1e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-sm"
                >
                  Add Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1226] border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Edit Habit
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Renaming a habit preserves all your past completion history safely.
            </p>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Habit Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#070d1e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-[#070d1e] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingHabit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingHabitId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1226] border border-red-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span>Delete Habit?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This habit will be removed from your active daily list. Your historical completion records for past days will remain safe in storage.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingHabitId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Keep Habit
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-sm"
              >
                Delete Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Day Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a1226] border border-amber-500/30 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              <span>Reset Checks for {selectedDate}?</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will uncheck all habits for {formatDateDisplay(selectedDate)}. Other days' records will not be affected.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetDayCompletions(selectedDate);
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-colors shadow-sm"
              >
                Reset Checks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
