import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Bookmark, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Lightbulb, 
  PenTool,
  Save,
  Check
} from 'lucide-react';
import { SkillItem, SkillUserNote } from '../types';
import { SKILLS_LIST } from '../data/defaultSkills';
import { getLocalDateString } from '../utils/dateUtils';

interface SkillsViewProps {
  skillNotes: Record<number, SkillUserNote>;
  onUpdateSkillNote: (skillId: number, update: Partial<SkillUserNote>) => void;
}

export const SkillsView: React.FC<SkillsViewProps> = ({
  skillNotes,
  onUpdateSkillNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedSkillId, setExpandedSkillId] = useState<number | null>(1); // Default first skill open
  const [editingNotesId, setEditingNotesId] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [saveSuccessId, setSaveSuccessId] = useState<number | null>(null);

  const categories = [
    'All',
    'Communication',
    'Mindset',
    'Emotional Mastery',
    'Discipline & Habits',
    'Life Design',
  ];

  const filteredSkills = selectedCategory === 'All'
    ? SKILLS_LIST
    : SKILLS_LIST.filter(s => s.category === selectedCategory);

  const todayStr = getLocalDateString();

  const handleToggleFocus = (skillId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = skillNotes[skillId]?.isFocused;
    onUpdateSkillNote(skillId, { isFocused: !current });
  };

  const handleTogglePractice = (skillId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentNotes = skillNotes[skillId] || { skillId };
    const dates = currentNotes.completedExerciseDates || [];
    const isAlreadyDoneToday = dates.includes(todayStr);

    const updatedDates = isAlreadyDoneToday
      ? dates.filter(d => d !== todayStr)
      : [...dates, todayStr];

    onUpdateSkillNote(skillId, { completedExerciseDates: updatedDates });
  };

  const handleStartEditNote = (skill: SkillItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNotesId(skill.id);
    setNoteDraft(skillNotes[skill.id]?.personalNotes || '');
  };

  const handleSaveNote = (skillId: number) => {
    onUpdateSkillNote(skillId, { personalNotes: noteDraft.trim() });
    setEditingNotesId(null);
    setSaveSuccessId(skillId);
    setTimeout(() => setSaveSuccessId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-[#0c1630] via-[#091124] to-[#0a1428] rounded-2xl p-5 sm:p-6 border border-amber-500/20 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-amber-400 uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Wisdom Matrix</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
          The 14 Self-Development Skills
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Mastering these fourteen lifelong principles will transform your communication, cognitive resilience, emotional sovereignty, and daily habits.
        </p>

        {/* Category Filters (Segmented control) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mt-5 -mx-1 px-1 scrollbar-thin">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-[#070d1e]/80 text-slate-400 border-white/5 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Skills Grid / Accordion */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => {
          const userNote = skillNotes[skill.id];
          const isFocused = !!userNote?.isFocused;
          const practicedDates = userNote?.completedExerciseDates || [];
          const practicedToday = practicedDates.includes(todayStr);
          const hasPersonalNotes = !!userNote?.personalNotes;
          const isExpanded = expandedSkillId === skill.id;
          const isEditingThisNote = editingNotesId === skill.id;

          return (
            <div
              key={skill.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? 'bg-[#0a1226] border-amber-500/30 shadow-xl'
                  : 'bg-[#080e1e]/90 border-white/5 hover:border-amber-500/20'
              }`}
            >
              {/* Main Skill Summary Bar */}
              <div
                onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs tabular-nums flex-shrink-0 transition-colors ${
                      isFocused
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-[#0e1730] border border-white/10 text-amber-300/90'
                    }`}
                  >
                    {String(skill.id).padStart(2, '0')}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
                      <span>{skill.category}</span>
                      {isFocused && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <Bookmark className="w-3 h-3 fill-amber-400" />
                            Current Focus
                          </span>
                        </>
                      )}
                      {practicedToday && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-teal-300 font-medium">Practiced Today</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-0.5 tracking-tight truncate">
                      {skill.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={(e) => handleToggleFocus(skill.id, e)}
                    className={`p-2 rounded-lg border transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                      isFocused
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'text-slate-500 hover:text-amber-300 border-transparent hover:bg-white/5'
                    }`}
                    title={isFocused ? 'Remove focus priority' : 'Mark as active focus skill'}
                    aria-label={`Toggle focus for ${skill.title}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isFocused ? 'fill-amber-400' : ''}`} />
                  </button>

                  <div className="p-2 text-slate-400 hover:text-white rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Skill Body */}
              {isExpanded && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-1 border-t border-white/5 space-y-4">
                  {/* Short Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>Description</span>
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>

                  {/* Practical Exercise Box */}
                  <div className="bg-[#070d1e] rounded-xl p-4 border border-teal-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-teal-300" />
                        <span>Practical Exercise</span>
                      </span>

                      <button
                        onClick={(e) => handleTogglePractice(skill.id, e)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                          practicedToday
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'bg-white/5 text-slate-300 hover:text-white border-white/10 hover:border-teal-500/30'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${practicedToday ? 'text-teal-400' : 'text-slate-400'}`} />
                        <span>{practicedToday ? 'Practiced Today!' : 'Mark Practiced Today'}</span>
                      </button>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">
                      {skill.exercise}
                    </p>

                    {practicedDates.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] text-slate-400 flex items-center gap-1">
                        <span>Total times practiced:</span>
                        <span className="font-semibold text-teal-300 tabular-nums">
                          {practicedDates.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Key Philosophy / Takeaway */}
                  <div className="bg-[#0e1730]/40 rounded-xl p-3 border border-amber-500/10">
                    <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider block mb-0.5">
                      Core Principle
                    </span>
                    <p className="text-xs text-amber-200/90 italic">
                      "{skill.keyTakeaway}"
                    </p>
                  </div>

                  {/* Personal Reflections / Notes for this Skill */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5 text-slate-400" />
                        <span>Your Personal Action Notes</span>
                      </span>

                      {!isEditingThisNote && (
                        <button
                          onClick={(e) => handleStartEditNote(skill, e)}
                          className="text-xs text-amber-300 hover:text-amber-200 font-medium py-1 px-2 hover:bg-white/5 rounded-md transition-colors"
                        >
                          {hasPersonalNotes ? 'Edit Notes' : '+ Add Note'}
                        </button>
                      )}
                    </div>

                    {isEditingThisNote ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={3}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="How did you apply this skill? What did you notice in yourself or others?"
                          className="w-full bg-[#070d1e] border border-amber-500/30 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(skill.id)}
                            className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    ) : hasPersonalNotes ? (
                      <div className="bg-[#070d1e] p-3 rounded-xl border border-white/5 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap">
                        {userNote.personalNotes}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No personal notes written yet. Jot down situations where you practiced this skill.
                      </p>
                    )}

                    {saveSuccessId === skill.id && (
                      <span className="text-xs text-teal-300 flex items-center gap-1 mt-1 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Notes saved successfully</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
