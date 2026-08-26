import { ProfilePersona } from '../types';

/**
 * Class card/chip color:
 * - Eve or Abbie view: the class's own color (whatever they picked)
 * - Both view: the color that person chose for themselves
 */
export function classPersonaColor(
  itemProfile: ProfilePersona | undefined,
  activeProfile: ProfilePersona,
  profileColors: Record<ProfilePersona, string>,
  classColor?: string
): string {
  const owner = itemProfile || 'Eve';
  const personColor = profileColors[owner] || classColor || '#2563eb';
  if (activeProfile === 'Both') return personColor;
  return classColor || personColor;
}

/**
 * Habit color is the one picked on the habit.
 * Both view uses that same color (not Eve/Abbie persona colors).
 */
export function habitItemColor(
  habitColor: string | undefined,
  itemProfile: ProfilePersona | undefined,
  profileColors: Record<ProfilePersona, string>
): string {
  if (habitColor) return habitColor;
  const owner = itemProfile || 'Eve';
  return profileColors[owner] || (owner === 'Eve' ? '#8B7CF6' : owner === 'Abbie' ? '#E98BAF' : '#83B79A');
}

