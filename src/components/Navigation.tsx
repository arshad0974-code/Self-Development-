import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookMarked, 
  TrendingUp, 
  Settings,
  CalendarDays,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { formatDateDisplay, getLocalDateString } from '../utils/dateUtils';

export type NavTab = 'dashboard' | 'skills' | 'journal' | 'progress' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedDate: string;
  onSelectToday: () => void;
  user?: User | null;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  selectedDate,
  onSelectToday,
  user,
  onLogout,
}) => {
  const isToday = selectedDate === getLocalDateString();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'skills', label: '14 Skills', icon: Sparkles },
    { id: 'journal', label: 'Journal', icon: BookMarked },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Top Header - Mobile & Desktop */}
      <header className="sticky top-0 z-30 border-b border-amber-500/15 bg-[#070d1e]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-teal-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-lg shadow-sm">
              BV
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-tight">
                Better Version of Me
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Personal Self-Development & Daily Consistency
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0c152e] p-1 rounded-xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Date Indicator / Jump to Today */}
          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={onSelectToday}
                className="px-2.5 py-1 text-xs font-medium bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                title="Return to today"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Jump to</span> Today
              </button>
            )}
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-medium">
                {isToday ? 'Today' : 'Viewing'}
              </span>
              <span className="text-xs text-amber-300/90 font-semibold tabular-nums">
                {formatDateDisplay(selectedDate).split(',')[1]}
              </span>
            </div>

            {/* User Account / Logout Control */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-1 p-2 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-400 hover:text-red-300 bg-[#070d1e] hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all flex items-center gap-1.5 min-h-[40px] min-w-[40px] justify-center"
                title={user?.email ? `Sign out (${user.email})` : 'Sign out'}
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Fixed Mobile Bottom Tab Bar (thumb-zone ergonomic, min-h 44px hitboxes) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070d1e]/95 backdrop-blur-lg border-t border-amber-500/20 shadow-2xl pb-safe"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative py-1 transition-colors ${
                  isActive ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-10 h-7 flex items-center justify-center rounded-lg transition-all ${
                    isActive ? 'bg-amber-400/15 border border-amber-400/30' : ''
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'text-amber-300 font-semibold' : 'text-slate-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
