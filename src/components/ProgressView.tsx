import React, { useState } from 'react';
import { 
  TrendingUp, 
  Activity, 
  Sliders, 
  Flame, 
  Award, 
  Calendar 
} from 'lucide-react';
import { Habit, HabitCompletions, ConfidenceRating } from '../types';
import { 
  getLocalDateString, 
  formatDateDisplay, 
  getPastDates, 
  formatDayOfWeek,
  calculateHabitStats 
} from '../utils/dateUtils';
import { ConfidenceView } from './ConfidenceView';

interface ProgressViewProps {
  habits: Habit[];
  completions: HabitCompletions;
  ratings: Record<string, ConfidenceRating>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSaveRating: (rating: ConfidenceRating) => void;
  onNavigateToTab: (tab: 'dashboard' | 'skills' | 'journal' | 'progress' | 'settings') => void;
  defaultSubTab?: 'habits' | 'confidence';
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  habits,
  completions,
  ratings,
  selectedDate,
  onSelectDate,
  onSaveRating,
  onNavigateToTab,
  defaultSubTab = 'habits',
}) => {
  const [subTab, setSubTab] = useState<'habits' | 'confidence'>(defaultSubTab);

  const activeHabits = habits.filter(h => !h.archived);
  const todayStr = getLocalDateString();
  const stats = calculateHabitStats(completions);
  const past30Days = getPastDates(30, todayStr);

  // Calculate habit-by-habit completion counts across the last 30 days
  const habitCompletionCounts: Record<string, number> = {};
  activeHabits.forEach(h => {
    habitCompletionCounts[h.id] = 0;
  });

  past30Days.forEach(dateStr => {
    const dayMap = completions[dateStr] || {};
    activeHabits.forEach(h => {
      if (dayMap[h.id]) {
        habitCompletionCounts[h.id] = (habitCompletionCounts[h.id] || 0) + 1;
      }
    });
  });

  // Calculate total possible vs completed over 30 days
  const totalPossible = activeHabits.length * 30;
  let totalDone = 0;
  past30Days.forEach(dateStr => {
    const dayMap = completions[dateStr] || {};
    activeHabits.forEach(h => {
      if (dayMap[h.id]) totalDone++;
    });
  });

  const overall30DayPercent = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Sub-Navigation Toggle between Habit Momentum and Confidence Tracker */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-1 p-1 bg-[#0c1630] rounded-xl border border-white/10 w-full sm:w-auto">
          <button
            onClick={() => setSubTab('habits')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'habits'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Habit Momentum</span>
          </button>
          <button
            onClick={() => setSubTab('confidence')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              subTab === 'confidence'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Confidence Calibration (1–10)</span>
          </button>
        </div>
      </div>

      {subTab === 'confidence' ? (
        <ConfidenceView
          ratings={ratings}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onSaveRating={onSaveRating}
        />
      ) : (
        <>
          {/* Header Banner */}
          <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Long-Term Analytics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              Habit Consistency & Momentum
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Visualized momentum strictly computed from your real daily localStorage records.
            </p>

            {/* High Level KPI Trio */}
            <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Current Streak</span>
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-amber-400 tabular-nums">
                    {stats.currentStreak}
                  </span>
                  <span className="text-xs text-slate-400">days</span>
                </div>
              </div>

              <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-teal-400" />
                  <span>Best Streak</span>
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-white tabular-nums">
                    {stats.bestStreak}
                  </span>
                  <span className="text-xs text-slate-400">days</span>
                </div>
              </div>

              <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Total Active Days</span>
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-teal-400 tabular-nums">
                    {stats.totalActiveDays}
                  </span>
                  <span className="text-xs text-slate-400">days</span>
                </div>
              </div>

              <div className="bg-[#070d1e]/60 rounded-xl p-3.5 border border-white/5">
                <span className="text-xs text-slate-400 block">30-Day Completion</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-amber-300 tabular-nums">
                    {overall30DayPercent}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 30-Day Calendar Heatmap / Grid */}
          <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  30-Day Daily Completion Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Intensity reflects the percentage of habits completed on each local day.
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>0%</span>
                <span className="w-3 h-3 rounded bg-slate-800" />
                <span className="w-3 h-3 rounded bg-amber-500/40" />
                <span className="w-3 h-3 rounded bg-teal-500/70" />
                <span className="w-3 h-3 rounded bg-teal-400" />
                <span>100%</span>
              </div>
            </div>

            {/* Grid of days */}
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
              {past30Days.map((dateStr) => {
                const dayMap = completions[dateStr] || {};
                const done = activeHabits.filter(h => dayMap[h.id]).length;
                const total = activeHabits.length;
                const pct = total > 0 ? (done / total) : 0;
                const isToday = dateStr === todayStr;

                let bgClass = 'bg-[#070d1e] text-slate-500 border-white/5';
                if (pct === 1) {
                  bgClass = 'bg-teal-500/80 text-slate-950 font-bold border-teal-400 shadow-sm';
                } else if (pct >= 0.6) {
                  bgClass = 'bg-teal-600/40 text-teal-200 border-teal-500/30';
                } else if (pct > 0) {
                  bgClass = 'bg-amber-500/30 text-amber-200 border-amber-500/30';
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      onSelectDate(dateStr);
                      onNavigateToTab('dashboard');
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all hover:scale-105 min-h-[52px] ${bgClass} ${
                      isToday ? 'ring-2 ring-amber-400/80' : ''
                    }`}
                    title={`${formatDateDisplay(dateStr)}: ${done}/${total} habits (${Math.round(pct * 100)}%)`}
                  >
                    <span className="text-[10px] uppercase tracking-tight opacity-75">
                      {formatDayOfWeek(dateStr)}
                    </span>
                    <span className="text-xs font-bold tabular-nums">
                      {dateStr.split('-')[2]}
                    </span>
                    <span className="text-[9px] tabular-nums mt-0.5">
                      {done}/{total}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Habit-by-Habit Breakdown */}
          <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg">
            <h3 className="text-sm sm:text-base font-bold text-white mb-1">
              Individual Habit Consistency (Past 30 Days)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tracking which daily disciplines are anchored and which need reinforcement.
            </p>

            <div className="space-y-3">
              {activeHabits.map((habit, idx) => {
                const count = habitCompletionCounts[habit.id] || 0;
                const pct = Math.round((count / 30) * 100);

                return (
                  <div key={habit.id} className="bg-[#070d1e]/80 p-3.5 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-400 tabular-nums">
                          0{idx + 1}.
                        </span>
                        <span className="font-semibold text-slate-200">
                          {habit.title}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-amber-300 tabular-nums">
                          {count} / 30
                        </span>
                        <span className="text-slate-500 text-[11px] font-normal">
                          ({pct}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-teal-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
