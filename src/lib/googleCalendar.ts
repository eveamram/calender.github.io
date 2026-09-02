import { CalendarEvent, ProfilePersona } from '../types';

const CONFIG_KEY = 'calender_google_calendar_v1';
const TOKEN_KEY = 'calender_google_access_token_v1';
const SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';
/** Shared via the existing date_colors table so removals stick across devices. */
export const GOOGLE_HIDDEN_STORE_ID = '__google_hidden_ids__';

const LOOKBACK_MS = 1000 * 60 * 60 * 24 * 62; // ~2 months
const LOOKAHEAD_MS = 1000 * 60 * 60 * 24 * 400; // ~13 months

export interface GoogleCalendarLink {
  id: string;
  summary: string;
  backgroundColor?: string;
  primary?: boolean;
  enabled: boolean;
  profile: ProfilePersona;
}

export interface GoogleCalendarConfig {
  clientId: string;
  email: string | null;
  calendars: GoogleCalendarLink[];
  lastSyncedAt: number | null;
  /** Google event ids removed from this app calendar. Sync will not restore them. */
  hiddenEventIds: string[];
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

interface GoogleTokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}

interface GoogleTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: GoogleTokenResponse) => void;
          }) => GoogleTokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export function envGoogleClientId(): string {
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return typeof fromEnv === 'string' ? fromEnv.trim() : '';
}

export function emptyGoogleConfig(): GoogleCalendarConfig {
  return {
    clientId: envGoogleClientId(),
    email: null,
    calendars: [],
    lastSyncedAt: null,
    hiddenEventIds: [],
  };
}

export function loadGoogleConfig(): GoogleCalendarConfig {
  const fallback = emptyGoogleConfig();
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GoogleCalendarConfig>;
    return {
      clientId: (parsed.clientId || fallback.clientId || '').trim(),
      email: parsed.email || null,
      calendars: Array.isArray(parsed.calendars) ? parsed.calendars : [],
      lastSyncedAt: typeof parsed.lastSyncedAt === 'number' ? parsed.lastSyncedAt : null,
      hiddenEventIds: Array.isArray(parsed.hiddenEventIds) ? parsed.hiddenEventIds.filter(Boolean) : [],
    };
  } catch {
    return fallback;
  }
}

export function saveGoogleConfig(config: GoogleCalendarConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function resolvedGoogleClientId(config: GoogleCalendarConfig): string {
  return (config.clientId || envGoogleClientId()).trim();
}

export function isGoogleSyncedEvent(evt: { id?: string; source?: string }): boolean {
  return evt.source === 'google' || Boolean(evt.id && evt.id.startsWith('gcal-'));
}

export function normalizeEventTitle(title?: string): string {
  const base = (title || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ');
  try {
    return base.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return base.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

export function normalizeEventTime(time?: string): string {
  if (!time) return '';
  const raw = time.trim().toLowerCase();
  if (!raw || raw === 'all day' || raw === 'all-day' || raw === 'habit') return '';

  const ampm = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([ap]m)$/i);
  if (ampm) {
    let hours = parseInt(ampm[1], 10);
    const minutes = parseInt(ampm[2] || '0', 10);
    const mer = ampm[3].toLowerCase();
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';
    if (mer === 'pm' && hours < 12) hours += 12;
    if (mer === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const parts = raw.split(':');
  if (parts.length < 2) return '';
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function eventDedupeKey(evt: Pick<CalendarEvent, 'title' | 'event_date' | 'start_time'>): string {
  return `${normalizeEventTitle(evt.title)}|${evt.event_date || ''}|${normalizeEventTime(evt.start_time)}`;
}

export function parseHiddenGoogleEventIds(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === 'string' && id.length > 0);
  } catch {
    return [];
  }
}

export function filterIncomingEvents(
  incoming: CalendarEvent[],
  existing: CalendarEvent[],
  suppressedIds: Iterable<string>,
  opts?: { ignoreIdPrefix?: string }
): CalendarEvent[] {
  const hidden = new Set(Array.from(suppressedIds).filter(Boolean));
  const taken = new Set<string>();
  for (const evt of existing) {
    if (!evt?.id) continue;
    if (opts?.ignoreIdPrefix && evt.id.startsWith(opts.ignoreIdPrefix)) continue;
    if (hidden.has(evt.id)) continue;
    const key = eventDedupeKey(evt);
    if (key.startsWith('|')) continue;
    taken.add(key);
  }

  const kept: CalendarEvent[] = [];
  for (const evt of incoming) {
    if (!evt?.id || hidden.has(evt.id)) continue;
    const key = eventDedupeKey(evt);
    if (taken.has(key)) continue;
    taken.add(key);
    kept.push(evt);
  }
  return kept;
}

export function googleEventPrefix(calendarId: string): string {
  return `gcal-${calendarKey(calendarId)}-`;
}

export function calendarKey(calendarId: string): string {
  let h = 2166136261;
  for (let i = 0; i < calendarId.length; i += 1) {
    h ^= calendarId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function sanitizeIdPart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function localDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function localTimeString(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return localDateString(dt);
}

function eachInclusiveDate(start: string, end: string): string[] {
  const dates: string[] = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 400) {
    dates.push(cur);
    cur = addDays(cur, 1);
    guard += 1;
  }
  return dates.length > 0 ? dates : [start];
}

function eachExclusiveEnd(start: string, endExclusive: string): string[] {
  if (!endExclusive || endExclusive <= start) return [start];
  const last = addDays(endExclusive, -1);
  return eachInclusiveDate(start, last);
}

function loadCachedToken(): string | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedToken;
    if (!parsed.accessToken || parsed.expiresAt < Date.now() + 30_000) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return parsed.accessToken;
  } catch {
    return null;
  }
}

function saveCachedToken(accessToken: string, expiresInSec?: number): void {
  const expiresAt = Date.now() + Math.max(60, expiresInSec || 3600) * 1000;
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify({ accessToken, expiresAt } satisfies CachedToken));
}

export function clearGoogleToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function hasCachedGoogleToken(): boolean {
  return Boolean(loadCachedToken());
}

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  const existing = document.querySelector('script[data-google-gis="true"]') as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in')));
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGis = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in. Check your network and try again.'));
    document.head.appendChild(script);
  });
}

let tokenClient: GoogleTokenClient | null = null;
let tokenClientId: string | null = null;
let pendingToken: {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
} | null = null;

function ensureTokenClient(clientId: string): GoogleTokenClient {
  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) {
    throw new Error('Google sign-in is not ready yet. Try again in a moment.');
  }
  if (!tokenClient || tokenClientId !== clientId) {
    tokenClientId = clientId;
    tokenClient = oauth.initTokenClient({
      client_id: clientId,
      scope: SCOPE,
      callback: (resp) => {
        const waiter = pendingToken;
        pendingToken = null;
        if (!waiter) return;
        if (resp.error || !resp.access_token) {
          waiter.reject(
            new Error(resp.error_description || resp.error || 'Google sign-in was cancelled')
          );
          return;
        }
        saveCachedToken(resp.access_token, resp.expires_in);
        waiter.resolve(resp.access_token);
      },
    });
  }
  return tokenClient;
}

export async function getGoogleAccessToken(
  clientId: string,
  interactive: boolean
): Promise<string> {
  if (!clientId) {
    throw new Error('Add a Google OAuth Client ID in Settings before connecting.');
  }
  const cached = loadCachedToken();
  if (cached) return cached;

  await loadGisScript();
  const client = ensureTokenClient(clientId);

  return new Promise((resolve, reject) => {
    pendingToken = { resolve, reject };
    try {
      client.requestAccessToken({ prompt: interactive ? 'select_account' : '' });
    } catch (err) {
      pendingToken = null;
      reject(err instanceof Error ? err : new Error('Google sign-in failed'));
    }
  });
}

export async function revokeGoogleAccess(): Promise<void> {
  const token = loadCachedToken();
  clearGoogleToken();
  if (!token || !window.google?.accounts?.oauth2) return;
  await new Promise<void>((resolve) => {
    window.google!.accounts.oauth2.revoke(token, () => resolve());
    window.setTimeout(() => resolve(), 1500);
  });
}

async function googleFetch<T>(token: string, url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    clearGoogleToken();
    throw new Error('Google sign-in expired. Tap Connect or Sync now and sign in again.');
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Google Calendar request failed (${res.status})${body ? `: ${body.slice(0, 180)}` : ''}`);
  }
  return (await res.json()) as T;
}

interface CalendarListEntry {
  id?: string;
  summary?: string;
  backgroundColor?: string;
  primary?: boolean;
  accessRole?: string;
}

interface CalendarListResponse {
  items?: CalendarListEntry[];
  nextPageToken?: string;
}

interface GoogleEventDate {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

interface GoogleApiEvent {
  id?: string;
  status?: string;
  summary?: string;
  location?: string;
  hangoutLink?: string;
  start?: GoogleEventDate;
  end?: GoogleEventDate;
}

interface EventsResponse {
  items?: GoogleApiEvent[];
  nextPageToken?: string;
}

export async function listGoogleCalendars(token: string): Promise<GoogleCalendarLink[]> {
  const calendars: GoogleCalendarLink[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ minAccessRole: 'reader', maxResults: '250' });
    if (pageToken) params.set('pageToken', pageToken);
    const data = await googleFetch<CalendarListResponse>(
      token,
      `https://www.googleapis.com/calendar/v3/users/me/calendarList?${params.toString()}`
    );
    for (const item of data.items || []) {
      if (!item.id) continue;
      calendars.push({
        id: item.id,
        summary: item.summary || item.id,
        backgroundColor: item.backgroundColor,
        primary: Boolean(item.primary),
        enabled: Boolean(item.primary),
        profile: 'Eve',
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);
  return calendars;
}

async function listGoogleEvents(token: string, calendarId: string): Promise<GoogleApiEvent[]> {
  const events: GoogleApiEvent[] = [];
  const timeMin = new Date(Date.now() - LOOKBACK_MS).toISOString();
  const timeMax = new Date(Date.now() + LOOKAHEAD_MS).toISOString();
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      singleEvents: 'true',
      orderBy: 'startTime',
      timeMin,
      timeMax,
      maxResults: '2500',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const encodedId = encodeURIComponent(calendarId);
    const data = await googleFetch<EventsResponse>(
      token,
      `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?${params.toString()}`
    );
    events.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);
  return events;
}

function mapGoogleEvent(
  apiEvent: GoogleApiEvent,
  calendar: GoogleCalendarLink
): CalendarEvent[] {
  if (!apiEvent.id || apiEvent.status === 'cancelled') return [];
  const start = apiEvent.start;
  const end = apiEvent.end;
  if (!start) return [];

  const title = (apiEvent.summary || '(Busy)').trim() || '(Busy)';
  const location = (apiEvent.location || apiEvent.hangoutLink || '').trim() || undefined;
  const color = calendar.backgroundColor || '#4285F4';
  const baseId = `${googleEventPrefix(calendar.id)}${sanitizeIdPart(apiEvent.id)}`;

  if (start.date) {
    const dates = eachExclusiveEnd(start.date, end?.date || addDays(start.date, 1));
    return dates.map((event_date) => ({
      id: dates.length === 1 ? baseId : `${baseId}-${event_date}`,
      title,
      event_type: 'personal',
      event_date,
      location,
      color,
      profile: calendar.profile,
      source: 'google',
      google_calendar_id: calendar.id,
    }));
  }

  if (!start.dateTime) return [];
  const startDt = new Date(start.dateTime);
  if (Number.isNaN(startDt.getTime())) return [];
  const endDt = end?.dateTime ? new Date(end.dateTime) : new Date(startDt.getTime() + 60 * 60 * 1000);
  const startDate = localDateString(startDt);
  const endDate = localDateString(endDt);
  const dates = eachInclusiveDate(startDate, endDate);

  return dates.map((event_date, index) => {
    const isFirst = index === 0;
    const isLast = index === dates.length - 1;
    return {
      id: dates.length === 1 ? baseId : `${baseId}-${event_date}`,
      title,
      event_type: 'personal' as const,
      event_date,
      start_time: isFirst ? localTimeString(startDt) : '00:00',
      end_time: isLast ? localTimeString(endDt) : '23:59',
      location,
      color,
      profile: calendar.profile,
      source: 'google' as const,
      google_calendar_id: calendar.id,
    };
  });
}

export async function fetchGoogleEventsForCalendars(
  token: string,
  calendars: GoogleCalendarLink[]
): Promise<Record<string, CalendarEvent[]>> {
  const byCalendar: Record<string, CalendarEvent[]> = {};
  for (const calendar of calendars) {
    if (!calendar.enabled) {
      byCalendar[calendar.id] = [];
      continue;
    }
    const apiEvents = await listGoogleEvents(token, calendar.id);
    byCalendar[calendar.id] = apiEvents.flatMap((evt) => mapGoogleEvent(evt, calendar));
  }
  return byCalendar;
}

export function mergeCalendarLists(
  incoming: GoogleCalendarLink[],
  existing: GoogleCalendarLink[],
  defaultProfile: ProfilePersona
): GoogleCalendarLink[] {
  const prev = new Map(existing.map((c) => [c.id, c]));
  return incoming.map((cal) => {
    const was = prev.get(cal.id);
    return {
      ...cal,
      enabled: was ? was.enabled : Boolean(cal.primary),
      profile: was?.profile || defaultProfile,
    };
  });
}
