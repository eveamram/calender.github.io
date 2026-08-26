import { ProfilePersona } from '../types';

/** Color for a class (or similar item). Shared "Both" items follow Eve/Abbie when you're in that person's view. */
export function classPersonaColor(
  itemProfile: ProfilePersona | undefined,
  activeProfile: ProfilePersona,
  profileColors: Record<ProfilePersona, string>,
  fallback?: string
): string {
  const owner = itemProfile || 'Eve';
  const colorKey: ProfilePersona =
    owner === 'Both' && (activeProfile === 'Eve' || activeProfile === 'Abbie')
      ? activeProfile
      : owner;
  return profileColors[colorKey] || fallback || '#2563eb';
}
