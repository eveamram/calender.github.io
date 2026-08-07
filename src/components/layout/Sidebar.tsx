import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { useAuth } from '../../context/AuthContext';
import { EVENT_TYPES, EventType } from '../../types';
import {
  Search,
  Users,
  User,
  Filter,
  Calendar as CalendarIcon,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Trophy,
  Flame,
} from 'lucide-react';
import { exportEventsToICS } from '../../lib/icsExport';

export const Sidebar: React.FC = () => {
  const {
    filterState,
    setFilterState,
    activeCalendar,
    members,
    events,
    filteredEvents,
    addToast,
  } = useCalendar();
  const { userProfile, user } = useAuth();
  const [copiedCode, setCopiedCode] = React.useState(false);

  const currentUserId = userProfile?.id || user?.id;

  const courses = Array.from(
    new Set(events.map((e) => e.course).filter((c): c is string => Boolean(c && c.trim())))
  );

  const handleCopyInviteCode = () => {
    if (activeCalendar?.invite_code) {
      navigator.clipboard.writeText(activeCalendar.invite_code);
      setCopiedCode(true);
      addToast('Invite code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleExportAll = () => {
    exportEventsToICS(filteredEvents, `${activeCalendar?.name || 'Shared-Calendar'}.ics`);
    addToast('Calendar exported to .ics file', 'success');
  };

  // Find nearest upcoming exam
  const upcomingExam = events
    .filter((e) => e.event_type === 'Exam' && new Date(e.event_date + 'T23:59:59') >= new Date())
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0];

  const getExamCountdownText = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow!';
    return `In ${diffDays} days`;
  };

  // Calculate task completion progress
  const totalEvents = events.length;
  const completedEvents = events.filter((e) => e.is_completed).length;
  const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Calendar & Share Info */}
      <div className="glass-card" style={{ padding: '1rem' }}>
        <div style={{ fontSize: '0.725rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
          Shared Calendar
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.65rem', color: 'var(--text-primary)' }}>
          {activeCalendar?.name || 'My Calendar'}
        </h2>

        {activeCalendar?.invite_code && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopyInviteCode}
            style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem 0.65rem', justifyContent: 'space-between' }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Invite Code: <strong style={{ color: 'var(--text-primary)' }}>{activeCalendar.invite_code}</strong></span>
            {copiedCode ? <Check size={13} style={{ color: '#10B981' }} /> : <Copy size={13} />}
          </button>
        )}
      </div>

      {/* Fun Study Progress & Streak Widget */}
      <div className="glass-card" style={{ padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Trophy size={14} /> Progress Streak
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981' }}>
            {progressPercent}% Complete
          </span>
        </div>

        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--bg-active)',
          borderRadius: '999px',
          overflow: 'hidden',
          marginBottom: '0.5rem',
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent-gradient)',
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>{completedEvents} done</span>
          <span>{totalEvents - completedEvents} remaining</span>
        </div>
      </div>

      {/* Embedded Clean Exam Countdown Card */}
      {upcomingExam && (
        <div className="glass-card" style={{
          padding: '1rem',
          borderLeft: '3px solid #EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase' }}>
              🚨 Next Exam
            </span>
            <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
              {getExamCountdownText(upcomingExam.event_date)}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
            {upcomingExam.title}
          </div>

          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarIcon size={12} /> {upcomingExam.event_date}
            {upcomingExam.course && <span>• {upcomingExam.course}</span>}
          </div>
        </div>
      )}

      {/* Clean Filters Section */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.825rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
            <Filter size={14} /> Filter Events
          </span>
          {(filterState.search || filterState.personFilter !== 'all' || filterState.eventTypeFilter !== 'all' || filterState.courseFilter !== 'all') && (
            <button
              type="button"
              onClick={() => setFilterState({ search: '', personFilter: 'all', eventTypeFilter: 'all', courseFilter: 'all' })}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.725rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search events..."
            value={filterState.search}
            onChange={(e) => setFilterState((prev) => ({ ...prev, search: e.target.value }))}
            className="input-field"
            style={{ paddingLeft: '2.1rem', fontSize: '0.825rem', padding: '0.55rem 0.75rem 0.55rem 2.1rem' }}
          />
        </div>

        {/* Person Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Person
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button
              type="button"
              onClick={() => setFilterState((prev) => ({ ...prev, personFilter: 'all' }))}
              style={{
                padding: '0.4rem 0.65rem',
                borderRadius: '6px',
                border: 'none',
                textAlign: 'left',
                fontSize: '0.8rem',
                fontWeight: filterState.personFilter === 'all' ? 700 : 500,
                backgroundColor: filterState.personFilter === 'all' ? 'var(--accent-light)' : 'transparent',
                color: filterState.personFilter === 'all' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              👥 All Events
            </button>

            {members.map((m) => (
              <button
                key={m.user_id}
                type="button"
                onClick={() => setFilterState((prev) => ({ ...prev, personFilter: m.user_id }))}
                style={{
                  padding: '0.4rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '0.8rem',
                  fontWeight: filterState.personFilter === m.user_id ? 700 : 500,
                  backgroundColor: filterState.personFilter === m.user_id ? 'var(--accent-light)' : 'transparent',
                  color: filterState.personFilter === m.user_id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: m.profile_color }} />
                {m.display_name} {m.user_id === currentUserId ? '(Me)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div>
          <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
            Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {EVENT_TYPES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => setFilterState((prev) => ({
                  ...prev,
                  eventTypeFilter: prev.eventTypeFilter === t.label ? 'all' : t.label,
                }))}
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '0.725rem',
                  fontWeight: filterState.eventTypeFilter === t.label ? 700 : 500,
                  backgroundColor: filterState.eventTypeFilter === t.label ? t.color : 'var(--bg-hover)',
                  color: filterState.eventTypeFilter === t.label ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Filter */}
        {courses.length > 0 && (
          <div>
            <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
              Course
            </label>
            <select
              value={filterState.courseFilter}
              onChange={(e) => setFilterState((prev) => ({ ...prev, courseFilter: e.target.value }))}
              className="input-field"
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.65rem' }}
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        {/* Export Button */}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleExportAll}
          style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', marginTop: '0.25rem' }}
        >
          <Download size={13} /> Export .ics
        </button>
      </div>
    </aside>
  );
};
