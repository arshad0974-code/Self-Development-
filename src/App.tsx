/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Habit, 
  HabitCompletions, 
  JournalEntry, 
  ConfidenceRating, 
  SkillUserNote, 
  UserSettings 
} from './types';
import { DEFAULT_HABITS } from './data/defaultHabits';
import { 
  loadHabits, 
  saveHabits, 
  loadCompletions, 
  saveCompletions, 
  loadJournalEntries, 
  saveJournalEntries, 
  loadRatings, 
  saveRatings, 
  loadSkillNotes, 
  saveSkillNotes, 
  loadSettings, 
  saveSettings 
} from './utils/storage';
import { getLocalDateString } from './utils/dateUtils';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SkillsView } from './components/SkillsView';
import { JournalView } from './components/JournalView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';

function MainApp() {
  const { user, loading, logOut } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(() => getLocalDateString());

  // App persistent states
  const [habits, setHabits] = useState<Habit[]>(() => loadHabits());
  const [completions, setCompletions] = useState<HabitCompletions>(() => loadCompletions());
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>(() => loadJournalEntries());
  const [ratings, setRatings] = useState<Record<string, ConfidenceRating>>(() => loadRatings());
  const [skillNotes, setSkillNotes] = useState<Record<number, SkillUserNote>>(() => loadSkillNotes());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  // Reload state from storage (used when importing data or wiping data)
  const reloadAllFromStorage = useCallback(() => {
    setHabits(loadHabits());
    setCompletions(loadCompletions());
    setJournalEntries(loadJournalEntries());
    setRatings(loadRatings());
    setSkillNotes(loadSkillNotes());
    setSettings(loadSettings());
  }, []);

  // Listen for storage changes across windows/tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('bvom_')) {
        reloadAllFromStorage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [reloadAllFromStorage]);

  // Habit Actions
  const handleToggleHabit = (habitId: string, date: string) => {
    setCompletions(prev => {
      const currentDayMap = prev[date] || {};
      const isCurrentlyDone = !!currentDayMap[habitId];
      const updatedDayMap = {
        ...currentDayMap,
        [habitId]: !isCurrentlyDone,
      };

      const updated = {
        ...prev,
        [date]: updatedDayMap,
      };

      saveCompletions(updated);
      return updated;
    });
  };

  const handleAddHabit = (title: string, description: string) => {
    const newHabit: Habit = {
      id: `custom_habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      description,
      createdAt: new Date().toISOString(),
    };

    setHabits(prev => {
      const updated = [...prev, newHabit];
      saveHabits(updated);
      return updated;
    });
  };

  const handleEditHabit = (habitId: string, newTitle: string, newDescription: string) => {
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id === habitId) {
          return { ...h, title: newTitle, description: newDescription };
        }
        return h;
      });
      saveHabits(updated);
      return updated;
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    // Soft-archive habit to preserve past completions safely
    setHabits(prev => {
      const updated = prev.map(h => {
        if (h.id === habitId) {
          return { ...h, archived: true };
        }
        return h;
      });
      saveHabits(updated);
      return updated;
    });
  };

  const handleResetDayCompletions = (date: string) => {
    setCompletions(prev => {
      const updated = {
        ...prev,
        [date]: {},
      };
      saveCompletions(updated);
      return updated;
    });
  };

  const handleRestoreDefaultHabits = () => {
    setHabits(prev => {
      const existingIds = new Set(prev.map(h => h.id));
      const unarchivedPrev = prev.map(h => {
        if (DEFAULT_HABITS.some(dh => dh.id === h.id)) {
          return { ...h, archived: false };
        }
        return h;
      });

      const missingDefaults = DEFAULT_HABITS.filter(dh => !existingIds.has(dh.id));
      const updated = [...unarchivedPrev, ...missingDefaults];
      saveHabits(updated);
      return updated;
    });
  };

  // Journal Actions
  const handleSaveJournalEntry = (entry: JournalEntry) => {
    setJournalEntries(prev => {
      const updated = {
        ...prev,
        [entry.date]: entry,
      };
      saveJournalEntries(updated);
      return updated;
    });
  };

  const handleDeleteJournalEntry = (date: string) => {
    setJournalEntries(prev => {
      const copy = { ...prev };
      delete copy[date];
      saveJournalEntries(copy);
      return copy;
    });
  };

  // Confidence Rating Actions
  const handleSaveRating = (rating: ConfidenceRating) => {
    setRatings(prev => {
      const updated = {
        ...prev,
        [rating.date]: rating,
      };
      saveRatings(updated);
      return updated;
    });
  };

  // Skill Notes Actions
  const handleUpdateSkillNote = (skillId: number, update: Partial<SkillUserNote>) => {
    setSkillNotes(prev => {
      const current = prev[skillId] || { skillId };
      const updatedMap = {
        ...prev,
        [skillId]: {
          ...current,
          ...update,
        },
      };
      saveSkillNotes(updatedMap);
      return updatedMap;
    });
  };

  // Settings Actions
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  };

  // 1. Initial Authentication Check Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/25 to-teal-500/25 border border-amber-400/40 flex items-center justify-center text-amber-300 font-extrabold text-2xl shadow-xl mb-4 animate-pulse">
          BV
        </div>
        <div className="flex items-center gap-2.5 text-xs text-amber-400 font-semibold tracking-wide">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State: Show Authentication Screen
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Authenticated State: Render Protected Application
  return (
    <div className="min-h-screen bg-[#070d1e] text-slate-100 flex flex-col antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedDate={selectedDate}
        onSelectToday={() => setSelectedDate(getLocalDateString())}
        user={user}
        onLogout={logOut}
      />

      {/* Main Content View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            habits={habits}
            completions={completions}
            journalEntries={journalEntries}
            ratings={ratings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onToggleHabit={handleToggleHabit}
            onAddHabit={handleAddHabit}
            onEditHabit={handleEditHabit}
            onDeleteHabit={handleDeleteHabit}
            onResetDayCompletions={handleResetDayCompletions}
            onRestoreDefaultHabits={handleRestoreDefaultHabits}
            onNavigateToTab={setActiveTab}
            settings={settings}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsView
            skillNotes={skillNotes}
            onUpdateSkillNote={handleUpdateSkillNote}
          />
        )}

        {activeTab === 'journal' && (
          <JournalView
            journalEntries={journalEntries}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            habits={habits}
            completions={completions}
            ratings={ratings}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSaveRating={handleSaveRating}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onDataReset={reloadAllFromStorage}
            onRestoreDefaultHabits={handleRestoreDefaultHabits}
            user={user}
            onLogout={logOut}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
