import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Save, 
  Check, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Activity,
  Sliders
} from 'lucide-react';
import { ConfidenceRating } from '../types';
import { 
  getLocalDateString, 
  formatDateDisplay, 
  shiftDate,
  formatShortDate 
} from '../utils/dateUtils';

interface ConfidenceViewProps {
  ratings: Record<string, ConfidenceRating>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onSaveRating: (rating: ConfidenceRating) => void;
}

export const ConfidenceView: React.FC<ConfidenceViewProps> = ({
  ratings,
  selectedDate,
  onSelectDate,
  onSaveRating,
}) => {
  const currentSaved = ratings[selectedDate];

  const [confidence, setConfidence] = useState<number>(7);
  const [communication, setCommunication] = useState<number>(7);
  const [emotionalControl, setEmotionalControl] = useState<number>(7);
  const [decisionMaking, setDecisionMaking] = useState<number>(7);
  const [consistency, setConsistency] = useState<number>(7);
  const [notes, setNotes] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (currentSaved) {
      setConfidence(currentSaved.confidence || 7);
      setCommunication(currentSaved.communication || 7);
      setEmotionalControl(currentSaved.emotionalControl || 7);
      setDecisionMaking(currentSaved.decisionMaking || 7);
      setConsistency(currentSaved.consistency || 7);
      setNotes(currentSaved.notes || '');
    } else {
      setConfidence(7);
      setCommunication(7);
      setEmotionalControl(7);
      setDecisionMaking(7);
      setConsistency(7);
      setNotes('');
    }
    setSaveStatus(null);
  }, [selectedDate, currentSaved]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const entry: ConfidenceRating = {
      date: selectedDate,
      confidence,
      communication,
      emotionalControl,
      decisionMaking,
      consistency,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
    };
    onSaveRating(entry);
    setSaveStatus('Ratings saved for ' + selectedDate);
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const currentAverage = ((confidence + communication + emotionalControl + decisionMaking + consistency) / 5).toFixed(1);

  // Sorted list of all recorded dates
  const recordedDates = Object.keys(ratings).sort();

  // Metrics definition
  const metricConfigs = [
    {
      key: 'confidence',
      label: 'Confidence',
      value: confidence,
      setter: setConfidence,
      desc: 'Quiet trust in your abilities and willingness to take constructive risks.',
      color: 'amber',
    },
    {
      key: 'communication',
      label: 'Communication',
      value: communication,
      setter: setCommunication,
      desc: 'Clarity of articulation, deep listening, and brevity in dialogue.',
      color: 'teal',
    },
    {
      key: 'emotionalControl',
      label: 'Emotional Control',
      value: emotionalControl,
      setter: setEmotionalControl,
      desc: 'Composure under stress, pausing before impulsive emotional reactions.',
      color: 'amber',
    },
    {
      key: 'decisionMaking',
      label: 'Decision-Making',
      value: decisionMaking,
      setter: setDecisionMaking,
      desc: 'Decisiveness based on values, without chronic hesitation or second-guessing.',
      color: 'teal',
    },
    {
      key: 'consistency',
      label: 'Consistency',
      value: consistency,
      setter: setConsistency,
      desc: 'Keeping daily non-negotiable promises to yourself despite mood shifts.',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
          <Activity className="w-3.5 h-3.5" />
          <span>Internal State Calibration</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Confidence & Mastery Tracker
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track subjective self-perceptions across five pillars of personal capability.
            </p>
          </div>

          {/* Date Selector */}
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

        {/* Prominent Subjective Assessment Notice (Mandatory Requirement) */}
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
          <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Subjective Self-Assessment Notice:</strong> These scores represent your personal, subjective reflection for self-awareness and calibration. They are not objective intelligence measurements or psychological diagnoses.
          </span>
        </div>
      </section>

      {/* Daily Rating Sliders Form */}
      <section className="bg-[#0a1226] rounded-2xl p-5 sm:p-7 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider block">
              Rating For
            </span>
            <h3 className="text-lg font-bold text-white">
              {formatDateDisplay(selectedDate)}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 block">Day Average</span>
              <span className="text-lg font-bold text-amber-300 tabular-nums">
                {currentAverage} <span className="text-xs font-normal text-slate-400">/ 10</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Rating</span>
            </button>
          </div>
        </div>

        {saveStatus && (
          <div className="mt-4 p-3 rounded-xl bg-teal-950/70 border border-teal-500/40 text-teal-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-6 space-y-6">
          {metricConfigs.map((metric) => (
            <div key={metric.key} className="space-y-2 bg-[#070d1e]/70 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {metric.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {metric.desc}
                  </p>
                </div>
                <div className="flex items-baseline gap-1 bg-[#0b1428] px-3 py-1 rounded-lg border border-amber-500/20">
                  <span className="text-xl font-extrabold text-amber-300 tabular-nums">
                    {metric.value}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">/ 10</span>
                </div>
              </div>

              {/* Slider with 1-10 range */}
              <div className="pt-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={metric.value}
                  onChange={(e) => metric.setter(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                />

                {/* 1-10 Touch Numbers */}
                <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium px-1 mt-1 tabular-nums">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => metric.setter(num)}
                      className={`min-h-[30px] min-w-[24px] flex items-center justify-center rounded transition-colors ${
                        metric.value === num
                          ? 'text-amber-400 font-bold scale-110'
                          : 'hover:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Optional context note */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              Context Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Slept 7 hours, gave a presentation, felt calm afterwards..."
              className="w-full bg-[#070d1e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Calibration</span>
            </button>
          </div>
        </form>
      </section>

      {/* History & Trends of Recorded Ratings (No Fake Data) */}
      <section className="bg-[#0a1226] rounded-2xl p-5 border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Recorded Calibration History
            </h3>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">
            {recordedDates.length} {recordedDates.length === 1 ? 'day recorded' : 'days recorded'}
          </span>
        </div>

        {recordedDates.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Sliders className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium">No calibration records saved yet.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Save your first 1–10 rating above to start tracking your trajectory.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simple Visual Trend Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-2 font-semibold">Avg</th>
                    <th className="py-2.5 px-2 font-semibold">Conf.</th>
                    <th className="py-2.5 px-2 font-semibold">Comm.</th>
                    <th className="py-2.5 px-2 font-semibold">Emot.</th>
                    <th className="py-2.5 px-2 font-semibold">Decis.</th>
                    <th className="py-2.5 px-2 font-semibold">Consist.</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium tabular-nums">
                  {[...recordedDates].reverse().map((dateStr) => {
                    const r = ratings[dateStr];
                    const avg = ((r.confidence + r.communication + r.emotionalControl + r.decisionMaking + r.consistency) / 5).toFixed(1);
                    const isSelected = dateStr === selectedDate;

                    return (
                      <tr 
                        key={dateStr}
                        className={`transition-colors ${
                          isSelected ? 'bg-amber-500/10 text-amber-200' : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <td className="py-3 px-3 font-semibold whitespace-nowrap">
                          {formatShortDate(dateStr)}
                        </td>
                        <td className="py-3 px-2 text-amber-300 font-bold">
                          {avg}
                        </td>
                        <td className="py-3 px-2 text-slate-300">{r.confidence}</td>
                        <td className="py-3 px-2 text-slate-300">{r.communication}</td>
                        <td className="py-3 px-2 text-slate-300">{r.emotionalControl}</td>
                        <td className="py-3 px-2 text-slate-300">{r.decisionMaking}</td>
                        <td className="py-3 px-2 text-slate-300">{r.consistency}</td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onSelectDate(dateStr)}
                            className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold py-1 px-2 rounded hover:bg-white/5"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
