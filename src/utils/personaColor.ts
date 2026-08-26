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
