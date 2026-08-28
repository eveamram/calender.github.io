const RETIRED_IDS = new Set([
  'hbt-1787432450370-wtikf',
  'tsk-1787439097233-tgyqw',
  'tsk-1787440158272-6ko41',
  'tsk-1787587530334-wn7mk',
  'tsk-1787616192331-htk1c',
]);

/** Strip leftover water / sample to-dos from every device cache before the app boots. */
export function wipeRetiredCache(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (!key.startsWith('calender_app_table')) continue;
      if (!key.startsWith('calender_app_table_v6_')) {
        localStorage.removeItem(key);
        continue;
      }
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      const next = parsed.filter((item: { id?: string }) => !item?.id || !RETIRED_IDS.has(item.id));
      localStorage.setItem(key, JSON.stringify(next));
    }
  } catch (error) {
    console.warn('Could not clear leftover calendar cache:', error);
  }
}

wipeRetiredCache();
