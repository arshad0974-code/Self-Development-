import React, { useState, useEffect } from 'react';
import { 
  BookMarked, 
  Save, 
  Check, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Clock, 
  FileText,
  Sparkles
} from 'lucide-react';
import { JournalEntry } from '../types';
import { 
  getLocalDateString, 
  formatDateDisplay, 
  shiftDate 
} from '../utils/dateUtils';

interface JournalViewProps {
  journalEntries: Record<string, JournalEntry>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSaveEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (date: string) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  journalEntries,
  selectedDate,
  onSelectDate,
  onSaveEntry,
  onDeleteEntry,
}) => {
  const currentSaved = journalEntries[selectedDate];

  const [whatWentWell, setWhatWentWell] = useState('');
  const [mistakeMade, setMistakeMade] = useState('');
  const [whyHappened, setWhyHappened] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [whatDoDifferently, setWhatDoDifferently] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync state when selectedDate or saved data changes
  useEffect(() => {
    if (currentSaved) {
      setWhatWentWell(currentSaved.whatWentWell || '');
      setMistakeMade(currentSaved.mistakeMade || '');
      setWhyHappened(currentSaved.whyHappened || '');
      setWhatLearned(currentSaved.whatLearned || '');
      setWhatDoDifferently(currentSaved.whatDoDifferently || '');
    } else {
      setWhatWentWell('');
      setMistakeMade('');
      setWhyHappened('');
      setWhatLearned('');
      setWhatDoDifferently('');
    }
    setSaveStatus(null);
  }, [selectedDate, currentSaved]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entry: JournalEntry = {
      date: selectedDate,
      whatWentWell: whatWentWell.trim(),
      mistakeMade: mistakeMade.trim(),
      whyHappened: whyHappened.trim(),
      whatLearned: whatLearned.trim(),
      whatDoDifferently: whatDoDifferently.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSaveEntry(entry);
    setSaveStatus('Reflection saved safely');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const isEntryBlank = 
    !whatWentWell.trim() && 
    !mistakeMade.trim() && 
    !whyHappened.trim() && 
    !whatLearned.trim() && 
    !whatDoDifferently.trim();

  // All dates that have entries, sorted descending
  const pastEntryDates = Object.keys(journalEntries)
    .filter(d => {
      const e = journalEntries[d];
      return e && (e.whatWentWell || e.mistakeMade || e.whyHappened || e.whatLearned || e.whatDoDifferently);
    })
    .sort()
    .reverse();

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
          <BookMarked className="w-3.5 h-3.5" />
          <span>Introspection & Growth Log</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Daily Reflection
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Honest self-appraisal turns raw daily experience into permanent wisdom.
            </p>
          </div>

          {/* Date Picker Switcher */}
          <div className="flex items-center gap-1.5 self-start sm:self-center bg-[#070d1e]/80 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => onSelectDate(shiftDate(selectedDate, -1))}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) onSelectDate(e.target.value);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-amber-300 px-2 py-1 rounded focus:outline-none cursor-pointer"
            />
            <button
              onClick={() => onSelectDate(shiftDate(selectedDate, 1))}
              className="p-2 text-slate-300 hover:text-amber-300 hover:bg-white/5 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Journal Entry Form */}
      <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-7 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              Entry For
            </span>
            <h3 className="text-lg font-bold text-white">
              {formatDateDisplay(selectedDate)}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {currentSaved && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Clear journal entry for ${selectedDate}?`)) {
                    onDeleteEntry(selectedDate);
                  }
                }}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Clear this entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 p-3 rounded-xl bg-teal-950/70 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Question 1 */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              1. What went well today?
            </label>
            <p className="text-[11px] text-slate-400">
              Celebrate wins, sustained focus, or moments of grace no matter how small.
            </p>
            <textarea
              rows={3}
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              placeholder="e.g., Kept my composure during the contentious team meeting; exercised in the morning..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y min-h-[72px]"
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              2. What mistake did I make?
            </label>
            <p className="text-[11px] text-slate-400">
              Honest acknowledgment without harsh self-blame or excuses.
            </p>
            <textarea
              rows={3}
              value={mistakeMade}
              onChange={(e) => setMistakeMade(e.target.value)}
              placeholder="e.g., Checked notifications impulsively while working on the priority document..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y min-h-[72px]"
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              3. Why might it have happened?
            </label>
            <p className="text-[11px] text-slate-400">
              Look deeper into energy, environment, fatigue, or unmanaged emotional triggers.
            </p>
            <textarea
              rows={3}
              value={whyHappened}
              onChange={(e) => setWhyHappened(e.target.value)}
              placeholder="e.g., I skipped lunch and felt fatigued; left my phone in direct eye sight..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y min-h-[72px]"
            />
          </div>

          {/* Question 4 */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              4. What did I learn?
            </label>
            <p className="text-[11px] text-slate-400">
              Synthesize the insight into a clear personal principle.
            </p>
            <textarea
              rows={3}
              value={whatLearned}
              onChange={(e) => setWhatLearned(e.target.value)}
              placeholder="e.g., When my physical energy drops, my willpower against distractions drops proportionally..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y min-h-[72px]"
            />
          </div>

          {/* Question 5 */}
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-bold text-slate-200">
              5. What will I do differently next time?
            </label>
            <p className="text-[11px] text-slate-400">
              Concrete practical change to enact in your future routine.
            </p>
            <textarea
              rows={3}
              value={whatDoDifferently}
              onChange={(e) => setWhatDoDifferently(e.target.value)}
              placeholder="e.g., Put phone on Do Not Disturb in another room before opening my laptop..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-y min-h-[72px]"
            />
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/5">
            <span className="text-xs text-slate-400">
              {isEntryBlank 
                ? 'Blank entries are permitted; feel free to fill in whenever ready.' 
                : 'Entries persist locally in your browser storage.'}
            </span>

            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Reflection</span>
            </button>
          </div>
        </form>
      </section>

      {/* Past Journal Entries Archive */}
      <section className="bg-[#0a1226] rounded-2xl p-5 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Past Reflections Archive
            </h3>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {pastEntryDates.length} recorded {pastEntryDates.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {pastEntryDates.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No previous journal entries found.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Write your first reflection above to build your archive.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {pastEntryDates.map((dateStr) => {
              const entry = journalEntries[dateStr];
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={dateStr}
                  onClick={() => onSelectDate(dateStr)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                      : 'bg-[#070d1e] border-white/5 hover:border-white/20 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">
                        {formatDateDisplay(dateStr)}
                      </span>
                      {dateStr === getLocalDateString() && (
                        <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {entry.whatWentWell ? `Well: ${entry.whatWentWell}` : (entry.whatLearned ? `Learned: ${entry.whatLearned}` : 'Journal entry recorded')}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-500 font-medium self-end sm:self-center">
                    Reopen & Edit &rarr;
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
