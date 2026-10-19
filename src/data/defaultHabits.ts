import { Habit } from '../types';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'habit_learn_10m',
    title: 'Learn something useful for 10 minutes',
    description: 'Read an article, book chapter, or educational lesson.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_summarize_5m',
    title: 'Summarize what I learned in my own words for 5 minutes',
    description: 'Reinforce retention and mental clarity by synthesis.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_listen_carefully',
    title: 'Listen carefully before responding in a conversation',
    description: 'Give full attention and avoid interrupting.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_pause_react',
    title: 'Pause and think before reacting emotionally',
    description: 'Take a 3-second breath before replying under stress.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'habit_reflect_5m',
    title: 'Reflect on my day for 5 minutes',
    description: 'Review wins, missteps, and key learnings in your journal.',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];
