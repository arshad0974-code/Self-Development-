import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ShieldAlert, 
  Info, 
  RotateCcw, 
  User, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { UserSettings } from '../types';
import { exportAllData, importDataFromJson, clearAllData } from '../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onDataReset: () => void;
  onRestoreDefaultHabits: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onDataReset,
  onRestoreDefaultHabits,
}) => {
  const [userNameInput, setUserNameInput] = useState(settings.userName || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [saveNameSuccess, setSaveNameSuccess] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim()) return;
    onUpdateSettings({ userName: userNameInput.trim() });
    setSaveNameSuccess(true);
    setTimeout(() => setSaveNameSuccess(false), 2500);
  };

  const handleExport = () => {
    exportAllData();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJson(content);
        setImportStatus(result);
        if (result.success) {
          onDataReset(); // Reload from storage
        }
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const handlePerformDeleteAll = () => {
    if (deleteInputText.trim().toUpperCase() === 'DELETE') {
      clearAllData();
      setShowDeleteConfirm(false);
      setDeleteInputText('');
      onDataReset();
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Application Preferences & Storage</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
          Settings & Privacy
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-xl">
          Complete control over your personal data, audio feedback, and local backup files.
        </p>

        {/* Clear Mandatory Storage Privacy Notice */}
        <div className="mt-5 p-4 rounded-xl bg-[#070d1e] border border-amber-500/30 flex items-start gap-3 text-xs leading-relaxed text-amber-200/90">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-300 mb-1">
              Local Browser Storage Notice
            </h4>
            <p className="text-slate-300">
              Your habit history, daily reflections, and confidence ratings are stored exclusively in your browser’s local storage on this device. Your data is 100% private and offline-capable. It does not sync between devices and does not provide an automated cloud backup. To back up or transfer your data, use the <strong>Export JSON</strong> button below.
            </p>
          </div>
        </div>
      </section>

      {/* Profile & Sound Preferences */}
      <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg space-y-5">
        <h3 className="text-sm sm:text-base font-bold text-white border-b border-white/10 pb-3">
          Personal Preferences
        </h3>

        {/* Name input */}
        <form onSubmit={handleSaveName} className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">
            Your Greeting Name
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
                placeholder="Self-Seeker"
                className="w-full bg-[#070d1e] border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
            >
              {saveNameSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>Save</span>
            </button>
          </div>
        </form>

        {/* Tactile Audio Chime Toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#070d1e] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">
                Completion Sound Feedback
              </h4>
              <p className="text-xs text-slate-400">
                Play a subtle harmonic synthesizer chime when completing a habit.
              </p>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              settings.soundEnabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
            }`}
            aria-label="Toggle sound"
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
          </button>
        </div>
      </section>

      {/* Backup & Data Portability */}
      <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-white border-b border-white/10 pb-3">
          Data Export & Import
        </h3>
        <p className="text-xs text-slate-300">
          Export your complete history as a JSON file anytime to transfer between devices or maintain an offline backup archive.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              importStatus.success
                ? 'bg-teal-950/70 border-teal-500/40 text-teal-300'
                : 'bg-red-950/70 border-red-500/40 text-red-300'
            }`}
          >
            {importStatus.success ? <Check className="w-4 h-4 text-teal-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            className="p-4 bg-[#070d1e] hover:bg-[#0c1630] border border-amber-500/30 rounded-xl transition-all flex items-center gap-3 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-105 transition-transform flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Export Data (JSON)
              </span>
              <span className="text-xs text-slate-400">
                Download your habits, logs, and journals.
              </span>
            </div>
          </button>

          <label className="p-4 bg-[#070d1e] hover:bg-[#0c1630] border border-white/10 hover:border-amber-500/30 rounded-xl transition-all flex items-center gap-3 text-left group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-300 group-hover:scale-105 transition-transform flex-shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Import Backup (JSON)
              </span>
              <span className="text-xs text-slate-400">
                Restore progress from an exported file.
              </span>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {/* Restore default habits button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm('Restore default 5 foundational habits? Custom habits will not be erased.')) {
                onRestoreDefaultHabits();
              }
            }}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 py-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore 5 Default Foundational Habits</span>
          </button>
        </div>
      </section>

      {/* Danger Zone: Erase Everything */}
      <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-6 border border-red-500/20 shadow-lg space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-red-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Danger Zone</span>
        </h3>
        <p className="text-xs text-slate-300">
          Permanently delete all application data, habit completion records, journal reflections, and confidence calibrations stored in this browser.
        </p>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="px-4 py-2 bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete All App Data</span>
        </button>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a1226] border border-red-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Confirm Complete Data Deletion</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This action <strong>cannot be undone</strong>. All your streak records, journal entries, habit definitions, and ratings will be wiped from this browser.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-semibold text-slate-300">
                To confirm, type <span className="text-red-400 font-bold">DELETE</span> below:
              </label>
              <input
                type="text"
                value={deleteInputText}
                onChange={(e) => setDeleteInputText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#070d1e] border border-red-500/30 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-red-400 uppercase tracking-widest font-mono"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInputText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePerformDeleteAll}
                disabled={deleteInputText.trim().toUpperCase() !== 'DELETE'}
                className="px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-md"
              >
                Permanently Delete All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
