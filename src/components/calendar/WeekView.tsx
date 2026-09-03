import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CATEGORY_METAS, EventType, ProfilePersona, eventAccentColor } from '../../types';
import { formatTime12Hour } from '../../context/StoreContext';
import { hhmmFromMinutes, packOverlappingLanes, parseTimeToMinutes, ScheduleItem } from './DayHourGrid';

const HOUR_HEIGHT = 52;
const START_HOUR = 7;
const END_HOUR = 22;
const DEFAULT_DURATION_MIN = 60;

function formatHourLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function weekdayShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('default', { weekday: 'short' });
}

function dayNum(dateStr: string): string {
  return String(new Date(dateStr + 'T00:00:00').getDate());
}

interface WeekViewProps {
  weekDates: string[];
  itemsByDate: Map<string, ScheduleItem[]>;
  selectedDate: string;
  todayStr: string;
  activeProfile: ProfilePersona;
  profileColors: Record<ProfilePersona, string>;
  onSelectDate: (dateStr: string) => void;
  onOpenDay: (dateStr: string) => void;
  onOpenItem: (evt: ScheduleItem) => void;
  onAddEvent: (dateStr: string, startTime?: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  weekDates,
  itemsByDate,
  selectedDate,
  todayStr,
  activeProfile,
  onSelectDate,
  onOpenDay,
  onOpenItem,
  onAddEvent,
}) => {
  const hours = useMemo(() => Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i), []);
  const gridHeight = hours.length * HOUR_HEIGHT;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    if (!weekDates.includes(todayStr)) return;
    const tick = () => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    };
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, [weekDates, todayStr]);

  const nowTop = ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const showNow = weekDates.includes(todayStr);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !showNow) return;
    el.scrollTop = Math.max(0, nowTop - el.clientHeight * 0.3);
  }, [showNow, weekDates, nowTop]);

  const columns = weekDates.map((dateStr) => {
    const items = itemsByDate.get(dateStr) || [];
    const allDay: ScheduleItem[] = [];
    const timedRaw: { item: ScheduleItem; startMin: number; endMin: number }[] = [];
    for (const item of items) {
      const startMin = parseTimeToMinutes(item.start_time);
      if (startMin === null) {
        allDay.push(item);
        continue;
      }
      const parsedEnd = parseTimeToMinutes(item.end_time);
      let endMin = parsedEnd === null ? startMin + DEFAULT_DURATION_MIN : parsedEnd;
      if (endMin <= startMin) endMin = startMin + DEFAULT_DURATION_MIN;
      timedRaw.push({ item, startMin, endMin: Math.min(endMin, 24 * 60) });
    }
    return { dateStr, allDay, timed: packOverlappingLanes(timedRaw) };
  });

  const allDayMax = Math.max(1, ...columns.map((c) => c.allDay.length));

  const chipStyle = (evt: ScheduleItem) => {
    const meta = CATEGORY_METAS[evt.event_type as EventType] || CATEGORY_METAS.personal;
    const color = eventAccentColor(evt) || meta.color;
    return {
      backgroundColor: `${color}22`,
      borderLeft: `3px solid ${color}`,
      color: '#0f172a',
    };
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-slate-200">
            <div className="bg-white" />
            {weekDates.map((dateStr) => {
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelectDate(dateStr)}
                  onDoubleClick={() => onOpenDay(dateStr)}
                  className={`py-2.5 px-1 text-center border-l border-slate-100 cursor-pointer ${
                    isToday ? 'bg-rose-50' : isSelected ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {weekdayShort(dateStr)}
                  </div>
                  <div
                    className={`mx-auto mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      isToday ? 'bg-rose-500 text-white' : isSelected ? 'bg-blue-600 text-white' : 'text-slate-800'
                    }`}
                  >
                    {dayNum(dateStr)}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-slate-200">
            <div className="px-1 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 text-right pr-2">
              All day
            </div>
            {columns.map((col) => (
              <div
                key={col.dateStr}
                className={`border-l border-slate-100 p-1 min-h-[2.5rem] space-y-0.5 ${
                  col.dateStr === todayStr ? 'bg-rose-50/40' : ''
                }`}
                onClick={() => onAddEvent(col.dateStr, 'all day')}
                style={{ minHeight: `${Math.max(2.5, allDayMax * 1.35)}rem` }}
              >
                {col.allDay.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenItem(evt);
                    }}
                    className="w-full text-left text-[10px] font-bold truncate px-1.5 py-0.5 rounded-md cursor-pointer"
                    style={chipStyle(evt)}
                    title={evt.title}
                  >
                    {evt.title}
                    {activeProfile === 'Both' && evt.profile ? ` · ${evt.profile}` : ''}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div
            ref={scrollRef}
            className="overflow-y-auto overscroll-contain max-h-[calc(100vh-16rem)]"
          >
            <div className="relative" style={{ height: gridHeight }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-slate-100"
                  style={{ top: (hour - START_HOUR) * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                >
                  <span className="absolute -top-2 left-0 w-14 pr-2 text-right text-[10px] font-semibold text-slate-400 tabular-nums">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}

              <div className="absolute top-0 bottom-0 left-14 right-0 grid grid-cols-7">
                {columns.map((col) => (
                  <div
                    key={col.dateStr}
                    className={`relative border-l border-slate-100 cursor-pointer ${
                      col.dateStr === todayStr ? 'bg-rose-50/30' : ''
                    }`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      onAddEvent(col.dateStr, hhmmFromMinutes(START_HOUR * 60 + (y / HOUR_HEIGHT) * 60));
                    }}
                  >
                    {col.timed.map((t) => {
                      const top = ((t.startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                      const height = Math.max(22, ((t.endMin - t.startMin) / 60) * HOUR_HEIGHT);
                      const meta = CATEGORY_METAS[t.item.event_type as EventType] || CATEGORY_METAS.personal;
                      const color = eventAccentColor(t.item) || meta.color;
                      const owner = (t.item.profile || 'Eve') as ProfilePersona;
                      const widthPct = 100 / t.laneCount;
                      const leftPct = (t.lane / t.laneCount) * 100;
                      return (
                        <button
                          key={t.item.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenItem(t.item);
                          }}
                          className="absolute text-left rounded-md px-1 py-0.5 overflow-hidden cursor-pointer shadow-2xs"
                          style={{
                            top,
                            height,
                            left: `calc(${leftPct}% + 1px)`,
                            width: `calc(${widthPct}% - 2px)`,
                            backgroundColor: `${color}28`,
                            borderLeft: `3px solid ${color}`,
                            zIndex: 10 + t.lane,
                          }}
                          title={t.item.title}
                        >
                          <div
                            className="text-[10px] font-black leading-tight truncate"
                            style={{ color: '#0f172a' }}
                          >
                            {t.item.title}
                          </div>
                          {height >= 32 && (
                            <div className="text-[9px] font-semibold text-slate-600 truncate">
                              {formatTime12Hour(t.item.start_time)}
                              {activeProfile === 'Both' ? ` · ${owner}` : ''}
                            </div>
                          )}
                        </button>
                      );
                    })}

                    {showNow &&
                      col.dateStr === todayStr &&
                      nowTop >= 0 &&
                      nowTop <= gridHeight && (
                        <div
                          className="absolute left-0 right-0 z-20 pointer-events-none"
                          style={{ top: nowTop }}
                        >
                          <div className="relative flex items-center">
                            <div className="absolute -left-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <div className="w-full h-[2px] bg-rose-500" />
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
