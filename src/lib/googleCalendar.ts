import { CalendarEvent } from '../types';

export const GOOGLE_EVENT_PREFIX = 'gcal-';
export const GOOGLE_CALENDAR_SCOPE =
  'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.calendarlist.readonly';

const LS_CLIENT_ID = 'calender_google_client_id';
const LS_CONNECTED = 'calender_google_connected';
const LS_EMAIL = 'calender_google_email';
const LS_CALENDAR_ID = 'calender_google_calendar_id';
const LS_LAST_SYNC = 'calender_google_last_sync';
const LS_CAN_WRITE = 'calender_google_can_write';
const SS_TOKEN = 'calender_google_access_token';
const SS_TOKEN_EXP = 'calender_google_token_expiry';

const GCAL_API = 'https://www.googleapis.com/calendar/v3';
const LOCAL_EVENT_MARK = 'calenderLocal';
const GOOGLE_EVENT_COLOR = '#4285F4';

export interface GoogleCalendarListItem {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole?: string;
  backgroundColor?: string;
}

export interface GoogleEventRange {
  timeMin: string;
  timeMax: string;
}

export interface PersistedGoogleState {
  connected: boolean;
  email: string | null;
  calendarId: string;
  lastSync: string | null;
  canWrite: boolean;
}

export interface GoogleConnectResult {
  email: string | null;
  calendarId: string;
  calendars: GoogleCalendarListItem[];
  canWrite: boolean;
}

interface GisTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GisTokenClient {
  requestAccessToken: (override?: { prompt?: string }) => void;
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
  htmlLink?: string;
  start?: GoogleEventDate;
  end?: GoogleEventDate;
  extendedProperties?: { private?: Record<string, string> };
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (resp: GisTokenResponse) => void;
            error_callback?: (err: { type?: string; message?: string }) => void;
          }) => GisTokenClient;
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export function isGoogleEventId(id?: string): boolean {
  return typeof id === 'string' && id.startsWith(GOOGLE_EVENT_PREFIX);
}

export function getGoogleClientId(): string {
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';
  if (envId.trim()) return envId.trim();
  try {
    return (localStorage.getItem(LS_CLIENT_ID) || '').trim();
  } catch {
    return '';
  }
}

export function hasEnvGoogleClientId(): boolean {
  const envId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) || '';
  return Boolean(envId.trim());
}

export function saveGoogleClientId(clientId: string): void {
  localStorage.setItem(LS_CLIENT_ID, clientId.trim());
}

export function getPersistedGoogleState(): PersistedGoogleState {
  try {
    return {
      connected: localStorage.getItem(LS_CONNECTED) === 'true',
      email: localStorage.getItem(LS_EMAIL) || null,
      calendarId: localStorage.getItem(LS_CALENDAR_ID) || 'primary',
      lastSync: localStorage.getItem(LS_LAST_SYNC),
      canWrite: localStorage.getItem(LS_CAN_WRITE) !== 'false',
    };
  } catch {
    return { connected: false, email: null, calendarId: 'primary', lastSync: null, canWrite: true };
  }
}

export function persistSelectedCalendarId(id: string): void {
  localStorage.setItem(LS_CALENDAR_ID, id || 'primary');
}

export function persistLastSync(iso: string): void {
  localStorage.setItem(LS_LAST_SYNC, iso);
}

export function formatGoogleLastSync(iso: string | null): string {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}


function persistSession(partial: {
  connected?: boolean;
  email?: string | null;
  calendarId?: string;
  canWrite?: boolean;
}): void {
  if (partial.connected !== undefined) {
    localStorage.setItem(LS_CONNECTED, partial.connected ? 'true' : 'false');
  }
  if (partial.email !== undefined) {
    if (partial.email) localStorage.setItem(LS_EMAIL, partial.email);
    else localStorage.removeItem(LS_EMAIL);
  }
  if (partial.calendarId) localStorage.setItem(LS_CALENDAR_ID, partial.calendarId);
  if (partial.canWrite !== undefined) {
    localStorage.setItem(LS_CAN_WRITE, partial.canWrite ? 'true' : 'false');
  }
}

function getAccessToken(): string | null {
  try {
    const token = sessionStorage.getItem(SS_TOKEN);
    if (!token) return null;
    const exp = Number(sessionStorage.getItem(SS_TOKEN_EXP) || '0');
    if (exp && Date.now() > exp - 15_000) return null;
    return token;
  } catch {
    return null;
  }
}

function saveAccessToken(token: string, expiresIn?: number): void {
  sessionStorage.setItem(SS_TOKEN, token);
  const ttlMs = (typeof expiresIn === 'number' && expiresIn > 0 ? expiresIn : 3600) * 1000;
  sessionStorage.setItem(SS_TOKEN_EXP, String(Date.now() + ttlMs));
}

function clearAccessToken(): void {
  sessionStorage.removeItem(SS_TOKEN);
  sessionStorage.removeItem(SS_TOKEN_EXP);
}

export function hasUsableGoogleToken(): boolean {
  return Boolean(getAccessToken());
}

function waitForGis(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(timer);
        resolve();
      } else if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('Google Identity Services failed to load. Check your connection and try again.'));
      }
    }, 50);
  });
}

export async function requestGoogleAccessToken(interactive: boolean): Promise<string> {
  if (!interactive) {
    const existing = getAccessToken();
    if (existing) return existing;
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('A Google Cloud OAuth client ID is required to connect.');
  }

  await waitForGis();

  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_CALENDAR_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error_description || resp.error || 'Google sign-in was cancelled.'));
          return;
        }
        saveAccessToken(resp.access_token, resp.expires_in);
        resolve(resp.access_token);
      },
      error_callback: (err) => {
        reject(new Error(err?.message || 'Google sign-in was cancelled.'));
      },
    });
    client.requestAccessToken({ prompt: interactive ? 'select_account' : 'none' });
  });
}

function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function toLocalHm(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map((p) => Number(p));
  const d = new Date(parts[0], parts[1] - 1, parts[2] + days);
  return toLocalDateString(d);
}

function encodeCalId(calendarId: string): string {
  return encodeURIComponent(calendarId || 'primary');
}

function canWriteRole(role?: string): boolean {
  return role === 'owner' || role === 'writer';
}

export function calendarsForPicker(calendars: GoogleCalendarListItem[]): GoogleCalendarListItem[] {
  if (!calendars.length) {
    return [{ id: 'primary', summary: 'Primary', primary: true, accessRole: 'owner' }];
  }
  const writableOrPrimary = calendars.filter((c) => c.primary || canWriteRole(c.accessRole));
  const copy = (writableOrPrimary.length ? writableOrPrimary : calendars).slice();
  copy.sort((a, b) => {
    if (a.primary && !b.primary) return -1;
    if (!a.primary && b.primary) return 1;
    return a.summary.localeCompare(b.summary);
  });
  return copy;
}

async function gcalFetch(path: string, init: RequestInit = {}, retryAuth = true): Promise<Response> {
  let token = getAccessToken();
  if (!token) {
    token = await requestGoogleAccessToken(false);
  }
  const url = path.startsWith('http') ? path : `${GCAL_API}${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...((init.headers as Record<string, string>) || {}),
  };
  if (init.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && retryAuth) {
    clearAccessToken();
    try {
      await requestGoogleAccessToken(false);
    } catch {
      throw new Error('Google Calendar session expired. Connect again.');
    }
    return gcalFetch(path, init, false);
  }
  return res;
}

export async function listGoogleCalendars(): Promise<GoogleCalendarListItem[]> {
  const res = await gcalFetch('/users/me/calendarList?maxResults=250');
  if (!res.ok) {
    return [{ id: 'primary', summary: 'Primary', primary: true, accessRole: 'owner' }];
  }
  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      summary?: string;
      primary?: boolean;
      accessRole?: string;
      backgroundColor?: string;
    }>;
  };
  const items: GoogleCalendarListItem[] = (data.items || [])
    .filter((item) => Boolean(item.id))
    .map((item) => ({
      id: item.id as string,
      summary: item.summary || item.id || 'Untitled calendar',
      primary: Boolean(item.primary),
      accessRole: item.accessRole,
      backgroundColor: item.backgroundColor,
    }));
  return calendarsForPicker(items);
}

function emailFromCalendars(calendars: GoogleCalendarListItem[]): string | null {
  const primary = calendars.find((c) => c.primary) || calendars[0];
  if (primary?.id && primary.id.includes('@')) return primary.id;
  const withAt = calendars.find((c) => c.id.includes('@'));
  return withAt?.id || null;
}

export async function connectGoogle(interactive: boolean): Promise<GoogleConnectResult> {
  await requestGoogleAccessToken(interactive);
  const calendars = await listGoogleCalendars();
  const persisted = getPersistedGoogleState();
  const primary = calendars.find((c) => c.primary) || calendars[0];
  const preferred = persisted.calendarId;
  const calendarId =
    preferred && calendars.some((c) => c.id === preferred)
      ? preferred
      : primary?.id || 'primary';
  const selected = calendars.find((c) => c.id === calendarId) || primary;
  const email = emailFromCalendars(calendars) || persisted.email;
  const canWrite = selected ? canWriteRole(selected.accessRole) : true;
  persistSession({ connected: true, email, calendarId, canWrite });
  return { email, calendarId, calendars, canWrite };
}

export function disconnectGoogle(): void {
  const token = sessionStorage.getItem(SS_TOKEN);
  try {
    if (token && window.google?.accounts?.oauth2?.revoke) {
      window.google.accounts.oauth2.revoke(token);
    }
  } catch {
    // ignore revoke failures
  }
  clearAccessToken();
  localStorage.removeItem(LS_CONNECTED);
  localStorage.removeItem(LS_EMAIL);
  localStorage.removeItem(LS_CALENDAR_ID);
  localStorage.removeItem(LS_LAST_SYNC);
  localStorage.removeItem(LS_CAN_WRITE);
}

export function getDefaultGoogleRange(): GoogleEventRange {
  return monthRangeAround(new Date());
}

export function monthRangeAround(date: Date): GoogleEventRange {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 2, 1);
  return { timeMin: start.toISOString(), timeMax: end.toISOString() };
}

function mapGoogleApiEvent(item: GoogleApiEvent): CalendarEvent[] {
  if (!item.id || item.status === 'cancelled') return [];
  if (item.extendedProperties?.private?.[LOCAL_EVENT_MARK] === '1') return [];

  const start = item.start;
  if (!start) return [];

  const base = {
    title: item.summary?.trim() || '(No title)',
    event_type: 'personal' as const,
    location: item.location || undefined,
    color: GOOGLE_EVENT_COLOR,
    htmlLink: item.htmlLink,
    google_html_link: item.htmlLink,
    is_google_event: true,
  };

  if (start.date) {
    const startDate = start.date;
    const endExclusive = item.end?.date || addDays(startDate, 1);
    const dates: string[] = [];
    let cursor = startDate;
    let guard = 0;
    while (cursor < endExclusive && guard < 366) {
      dates.push(cursor);
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    if (dates.length === 0) dates.push(startDate);
    return dates.map((event_date) => ({
      ...base,
      id:
        dates.length === 1
          ? `${GOOGLE_EVENT_PREFIX}${item.id}`
          : `${GOOGLE_EVENT_PREFIX}${item.id}-${event_date}`,
      event_date,
    }));
  }

  if (start.dateTime) {
    const startDt = new Date(start.dateTime);
    if (Number.isNaN(startDt.getTime())) return [];
    const mapped: CalendarEvent = {
      ...base,
      id: `${GOOGLE_EVENT_PREFIX}${item.id}`,
      event_date: toLocalDateString(startDt),
      start_time: toLocalHm(startDt),
    };
    if (item.end?.dateTime) {
      const endDt = new Date(item.end.dateTime);
      if (!Number.isNaN(endDt.getTime())) {
        mapped.end_time = toLocalHm(endDt);
      }
    }
    return [mapped];
  }

  return [];
}

export async function fetchGoogleEvents(
  calendarId: string,
  range: GoogleEventRange
): Promise<CalendarEvent[]> {
  const out: CalendarEvent[] = [];
  let pageToken: string | undefined;
  const calId = encodeCalId(calendarId || 'primary');

  do {
    const params = new URLSearchParams({
      timeMin: range.timeMin,
      timeMax: range.timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '250',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await gcalFetch(`/calendars/${calId}/events?${params.toString()}`);
    if (res.status === 401) {
      throw new Error('Google Calendar session expired. Connect again.');
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to load Google Calendar events.');
    }
    const data = (await res.json()) as { items?: GoogleApiEvent[]; nextPageToken?: string };
    for (const item of data.items || []) {
      out.push(...mapGoogleApiEvent(item));
    }
    pageToken = data.nextPageToken;
  } while (pageToken && out.length < 800);

  return out;
}

export async function insertGoogleEvent(
  calendarId: string,
  evt: {
    title: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
  }
): Promise<void> {
  return insertLocalEventToGoogle(calendarId, evt);
}

export async function insertLocalEventToGoogle(
  calendarId: string,
  evt: {
    title: string;
    event_date: string;
    start_time?: string;
    end_time?: string;
    location?: string;
  }
): Promise<void> {
  const tz = localTimeZone();
  const body: Record<string, unknown> = {
    summary: evt.title,
    location: evt.location || undefined,
    extendedProperties: { private: { [LOCAL_EVENT_MARK]: '1' } },
  };

  if (evt.start_time) {
    const startHm = evt.start_time.length === 5 ? `${evt.start_time}:00` : evt.start_time;
    let endHm: string;
    if (evt.end_time) {
      endHm = evt.end_time.length === 5 ? `${evt.end_time}:00` : evt.end_time;
    } else {
      const parts = evt.start_time.split(':');
      const h = Number(parts[0]);
      const m = Number(parts[1] || '0');
      const end = new Date(2000, 0, 1, h, m);
      end.setHours(end.getHours() + 1);
      endHm = `${pad2(end.getHours())}:${pad2(end.getMinutes())}:00`;
    }
    body.start = { dateTime: `${evt.event_date}T${startHm}`, timeZone: tz };
    body.end = { dateTime: `${evt.event_date}T${endHm}`, timeZone: tz };
  } else {
    body.start = { date: evt.event_date };
    body.end = { date: addDays(evt.event_date, 1) };
  }

  const res = await gcalFetch(`/calendars/${encodeCalId(calendarId || 'primary')}/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || 'Failed to add event to Google Calendar.');
  }
}
