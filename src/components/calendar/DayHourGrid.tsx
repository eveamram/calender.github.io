import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle, Circle, Pencil, Trash2 } from 'lucide-react';
import { formatTime12Hour } from '../../context/StoreContext';
import {
  CalendarEvent,
  CATEGORY_METAS,
  EventType,
  ProfilePersona,
  TaskItem,
  eventAccentColor,
} from '../../types';
import { isAnniversaryTitle } from '../../utils/holidays';
import { HeartsBackdrop } from './HeartsBackdrop';

export type ScheduleItem = CalendarEvent & {
  is_class_item?: boolean;
  is_habit_item?: boolean;
  class_original_id?: string;
  habit_original_id?: string;
  due_time?: string;
};

const HOUR_HEIGHT = 60;
const DEFAULT_START_HOUR = 7; // 7 AM
const DEFAULT_END_HOUR = 22; // 10 PM (inclusive label / last hour row)
const DEFAULT_DURATION_MIN = 60;
const MIN_EVENT_HEIGHT = 26;
const LABEL_OFFSET = 10; // keep hour labels from clipping at the top

const isClassScheduleItem = (evt: { is_class_item?: boolean; event_type?: string }) =>
  Boolean(evt.is_class_item || evt.event_type === 'class');

export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const raw = timeStr.trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  if (lower === 'habit' || lower === 'all day' || lower === 'all-day') return null;

  const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*([ap]m)$/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = parseInt(ampmMatch[2] || '0', 10);
    const ap = ampmMatch[3].toLowerCase();
    if (Number.isNaN(h) || Number.isNaN(m) || m > 59) return null;
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (h > 23) return null;
    return h * 60 + m;
  }

  const parts = raw.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (Number.isNaN(h) || Number.isNaN(m) || h > 24 || m > 59) return null;
  return Math.min(h * 60 + m, 24 * 60);
}

const isItemPastTime = (evt: ScheduleItem, dateStr: string, todayStr: string): boolean => {
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const targetTimeStr = evt.end_time || evt.start_time || evt.due_time;
  const mins = parseTimeToMinutes(targetTimeStr);
  if (mins === null) return false;
  return currentMinutes >= mins;
};

function formatHourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

interface TimedLayoutItem {
  item: ScheduleItem;
  startMin: number;
  endMin: number;
  lane: number;
  laneCount: number;
}

export function packOverlappingLanes(
  timed: { item: ScheduleItem; startMin: number; endMin: number }[]
): TimedLayoutItem[] {
  if (timed.length === 0) return [];

  const indexed = timed
    .map((t, originalIndex) => ({ ...t, originalIndex }))
    .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin || a.originalIndex - b.originalIndex);

  const layouts: TimedLayoutItem[] = timed.map((t) => ({
    ...t,
    lane: 0,
    laneCount: 1,
  }));

  let group: number[] = [];
  let groupEnd = -1;
  const laneEnds: number[] = [];

  const closeGroup = () => {
    if (group.length === 0) return;
    const nLanes = Math.max(...group.map((i) => layouts[i].lane)) + 1;
    for (const i of group) layouts[i].laneCount = nLanes;
    group = [];
    groupEnd = -1;
    laneEnds.length = 0;
  };

  for (const ev of indexed) {
    if (group.length > 0 && ev.startMin >= groupEnd) {
      closeGroup();
    }

    let lane = laneEnds.findIndex((end) => end <= ev.startMin);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(ev.endMin);
    } else {
      laneEnds[lane] = ev.endMin;
    }

    layouts[ev.originalIndex].lane = lane;
    group.push(ev.originalIndex);
    groupEnd = Math.max(groupEnd, ev.endMin);
  }
  closeGroup();

  return layouts;
}

export function compactTimeLabel(timeStr?: string): string {
  const mins = parseTimeToMinutes(timeStr);
  if (mins === null) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? 'p' : 'a';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

export function hhmmFromMinutes(totalMins: number): string {
  const snapped = Math.max(0, Math.min(23 * 60 + 30, Math.round(totalMins / 30) * 30));
  const h = Math.floor(snapped / 60);
  const m = snapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface DayHourGridProps {
  items: ScheduleItem[];
  selectedDate: string;
  todayStr: string;
  activeProfile: ProfilePersona;
  profileColors: Record<ProfilePersona, string>;
  tasks: TaskItem[];
  completedEventIds: string[];
  onOpenItem: (evt: ScheduleItem) => void;
  onToggleComplete: (evt: ScheduleItem) => void;
  onDelete: (evt: ScheduleItem) => void;
  onAddEvent: (startTime?: string) => void;
  scrollMaxHeightClass?: string;
}

export const DayHourGrid: React.FC<DayHourGridProps> = ({
  items,
  selectedDate,
  todayStr,
  activeProfile,
  profileColors,
  tasks,
  completedEventIds,
  onOpenItem,
  onToggleComplete,
  onDelete,
  onAddEvent,
  scrollMaxHeightClass = 'max-h-[min(52vh,28rem)]',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isToday = selectedDate === todayStr;
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    if (!isToday) return;
    const tick = () => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [isToday, selectedDate]);

  const { untimed, timedLayout, startHour, endHour } = useMemo(() => {
    const untimedItems: ScheduleItem[] = [];
    const timedRaw: { item: ScheduleItem; startMin: number; endMin: number }[] = [];

    for (const item of items) {
      const startMin = parseTimeToMinutes(item.start_time);
      if (startMin === null) {
        untimedItems.push(item);
        continue;
      }
      const parsedEnd = parseTimeToMinutes(item.end_time);
      let endMin = parsedEnd === null ? startMin + DEFAULT_DURATION_MIN : parsedEnd;
      if (endMin <= startMin) endMin = startMin + DEFAULT_DURATION_MIN;
      endMin = Math.min(endMin, 24 * 60);
      timedRaw.push({ item, startMin, endMin });
    }

    let rangeStart = DEFAULT_START_HOUR;
    let rangeEnd = DEFAULT_END_HOUR;
    for (const t of timedRaw) {
      rangeStart = Math.min(rangeStart, Math.floor(t.startMin / 60));
      const lastHour =
        t.endMin > 0 && t.endMin % 60 === 0 ? t.endMin / 60 - 1 : Math.floor(t.endMin / 60);
      rangeEnd = Math.max(rangeEnd, lastHour, Math.floor(t.startMin / 60));
    }
    rangeStart = Math.max(0, rangeStart);
    rangeEnd = Math.min(23, Math.max(rangeStart, rangeEnd));

    return {
      untimed: untimedItems,
      timedLayout: packOverlappingLanes(timedRaw),
      startHour: rangeStart,
      endHour: rangeEnd,
    };
  }, [items]);

  const totalHours = endHour - startHour + 1;
  const gridHeight = totalHours * HOUR_HEIGHT;
  const hours = useMemo(
    () => Array.from({ length: totalHours }, (_, i) => startHour + i),
    [startHour, totalHours]
  );

  const showNowLine =
    isToday && nowMinutes >= startHour * 60 && nowMinutes <= (endHour + 1) * 60;
  const nowTop = ((nowMinutes - startHour * 60) / 60) * HOUR_HEIGHT;

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !isToday) return;
    const n = new Date();
    const mins = n.getHours() * 60 + n.getMinutes();
    const top = LABEL_OFFSET + ((mins - startHour * 60) / 60) * HOUR_HEIGHT;
    el.scrollTop = Math.max(0, top - el.clientHeight * 0.35);
  }, [isToday, selectedDate, startHour, endHour]);

  const renderItemCard = (evt: ScheduleItem, opts?: { dense?: boolean; inGrid?: boolean }) => {
    const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
    const evtColor = eventAccentColor(evt) || meta.color || '#3b82f6';
    const task = evt.task_id ? tasks.find((t) => t.id === evt.task_id) : null;
    const ownerName = (evt.profile || 'Eve') as ProfilePersona;
    const badgeColor = profileColors[ownerName] || '#2563eb';
    const isClassItem = isClassScheduleItem(evt);
    const isPast = isItemPastTime(evt, selectedDate, todayStr);
    const isCompleted = isClassItem
      ? false
      : Boolean(evt.is_completed || task?.is_completed || completedEventIds.includes(evt.id));
    const isMuted = isPast || isCompleted;
    const dense = Boolean(opts?.dense);
    const inGrid = Boolean(opts?.inGrid);
    const showTime = !evt.is_habit_item && parseTimeToMinutes(evt.start_time) !== null;
    const isAnniv = isAnniversaryTitle(evt.title);

    return (
      <div
        key={evt.id}
        onClick={(e) => {
          e.stopPropagation();
          onOpenItem(evt);
        }}
        className={`relative overflow-hidden flex cursor-pointer group transition-all ${
          inGrid ? 'h-full overflow-hidden' : ''
        } ${
          dense
            ? 'items-start p-1.5 rounded-lg border'
            : 'items-center justify-between p-3 rounded-xl border'
        } ${
          isAnniv
            ? 'border-rose-200'
            : isMuted
              ? 'bg-slate-50/40 border-slate-100/70'
              : 'bg-white hover:bg-slate-50 border-slate-100'
        }`}
        style={{
          borderLeft: `3.5px solid ${isAnniv ? '#ec4899' : evtColor}`,
          backgroundColor: isAnniv
            ? undefined
            : isMuted
              ? undefined
              : `${evtColor}18`,
          background: isAnniv
            ? 'linear-gradient(90deg, #fff1f5 0%, #fce7f3 50%, #fbcfe8 100%)'
            : undefined,
        }}
      >
        {isAnniv && <HeartsBackdrop density="chip" />}
        <div className={`relative z-10 flex min-w-0 flex-1 ${dense ? 'items-start gap-1.5' : 'items-center gap-3'}`}>
          {!isClassItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(evt);
              }}
              className="p-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
              title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted ? (
                <CheckCircle
                  className={`w-3.5 h-3.5 ${
                    isPast && !evt.is_completed
                      ? 'text-slate-400 fill-slate-100'
                      : 'text-emerald-500 fill-emerald-50'
                  }`}
                />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300" />
              )}
            </button>
          )}

          <div className="min-w-0 flex-1">
            <h4
              className={`font-semibold leading-tight ${dense ? 'text-[11px]' : 'text-xs'} truncate ${
                isCompleted || isPast
                  ? 'line-through text-slate-400 opacity-75'
                  : isAnniv
                    ? 'text-rose-800'
                    : 'text-slate-900'
              }`}
            >
              {evt.title}
            </h4>

            <div
              className={`flex items-center gap-1.5 text-slate-400 flex-wrap ${
                dense ? 'text-[9px] mt-0.5' : 'text-[11px] mt-0.5'
              }`}
            >
              {showTime && (
                <span className="font-medium text-slate-500">
                  {formatTime12Hour(evt.start_time)}
                  {evt.end_time ? ` – ${formatTime12Hour(evt.end_time)}` : ''}
                </span>
              )}
              {evt.is_habit_item && !showTime && (
                <span className="font-medium text-slate-400">Habit</span>
              )}
              {!showTime && !evt.is_habit_item && !dense && (
                <span className="font-medium text-slate-400">All day</span>
              )}

              {activeProfile === 'Both' && (
                <span
                  className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded shrink-0 leading-none"
                  style={{ backgroundColor: badgeColor }}
                >
                  {ownerName}
                </span>
              )}

              {evt.location && !dense && (
                <span className="truncate max-w-[120px] text-slate-400">📍 {evt.location}</span>
              )}
            </div>
          </div>
        </div>

        <div className={`relative z-10 flex items-center shrink-0 ${dense ? 'gap-0 ml-0.5' : 'gap-1 ml-2'}`}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenItem(evt);
            }}
            className="p-0.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title={isClassItem ? 'Edit Class' : evt.is_habit_item ? 'Edit Habit' : 'Edit Event'}
          >
            <Pencil className={dense ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>

          {!evt.is_class_item && evt.event_type !== 'class' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(evt);
              }}
              className="p-0.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Event"
            >
              <Trash2 className={dense ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pt-0.5">
      <div className="grid grid-cols-[48px_minmax(0,1fr)] gap-1 pb-2 border-b border-slate-100">
        <div className="pt-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 text-right pr-1">
          All day
        </div>
        <div
          className="space-y-1 min-w-0 min-h-[2rem] rounded-lg cursor-pointer hover:bg-slate-50/80"
          onClick={() => onAddEvent('all day')}
          title="Add all-day event"
        >
          {untimed.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-1.5 px-1">Click to add an all-day event</p>
          ) : (
            untimed.map((evt) => renderItemCard(evt, { dense: true }))
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`overflow-y-auto overscroll-contain pr-0.5 ${scrollMaxHeightClass}`}
      >
        <div
          className="relative cursor-pointer"
          style={{ height: gridHeight + LABEL_OFFSET + 8 }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const y = e.clientY - rect.top - LABEL_OFFSET;
            onAddEvent(hhmmFromMinutes(startHour * 60 + (y / HOUR_HEIGHT) * 60));
          }}
          title="Click a time to add"
        >
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-slate-100"
              style={{ top: LABEL_OFFSET + (hour - startHour) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
            >
              <span className="absolute -top-2 left-0 w-12 pr-2 text-right text-[10px] font-semibold text-slate-400 tabular-nums">
                {formatHourLabel(hour)}
              </span>
              <div
                className="absolute left-12 right-0 top-1/2 border-t border-dashed border-slate-100/90"
                aria-hidden
              />
            </div>
          ))}
          <div
            className="absolute left-12 right-0 border-t border-slate-100"
            style={{ top: LABEL_OFFSET + totalHours * HOUR_HEIGHT }}
          />

          <div
            className="absolute left-12 right-0"
            style={{ top: LABEL_OFFSET, height: gridHeight }}
          >
            {timedLayout.map((layout) => {
              const top = ((layout.startMin - startHour * 60) / 60) * HOUR_HEIGHT;
              const rawHeight = ((layout.endMin - layout.startMin) / 60) * HOUR_HEIGHT;
              const height = Math.max(rawHeight, MIN_EVENT_HEIGHT);
              const widthPct = 100 / layout.laneCount;
              const leftPct = (layout.lane / layout.laneCount) * 100;
              const dense = height < 48 || layout.laneCount >= 2;

              return (
                <div
                  key={layout.item.id}
                  className="absolute"
                  style={{
                    top,
                    height,
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`,
                    zIndex: 10 + layout.lane,
                  }}
                >
                  {renderItemCard(layout.item, { dense, inGrid: true })}
                </div>
              );
            })}

            {showNowLine && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ top: nowTop }}
                aria-hidden
              >
                <div className="relative flex items-center">
                  <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
                  <div className="w-full h-[2px] bg-rose-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayHourGrid;
