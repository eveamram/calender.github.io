import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, Circle, Trash2, Calendar as CalendarIcon, Edit3, User, ChevronDown, ChevronRight, Check, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodoListViewProps {
  onOpenAddEvent?: () => void;
  onEditTask?: (task: CalendarEvent) => void;
}

const CATEGORY_TAGS = [
  { label: 'General', emoji: '✨' },
  { label: 'School', emoji: '📚' },
  { label: 'Work', emoji: '💼' },
  { label: 'Personal', emoji: '☕' },
  { label: 'Health', emoji: '🩺' },
  { label: 'Shopping', emoji: '🛍️' },
];

export const TodoListView: React.FC<TodoListViewProps> = ({ onEditTask }) => {
  const {
    filteredEvents,
    members,
    toggleEventCompleted,
    deleteEvent,
    addEvent,
    updateEvent,
    activePersonaFilter,
    showTodosOnCalendar,
    setShowTodosOnCalendar,
  } = useCalendar();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompletedOpen, setIsCompletedOpen] = useState(false); // Collapsed by default

  // Filter unified events strictly for tasks (type === 'task')
  const allTasks = filteredEvents.filter((evt) => evt.event_type === 'task');

  const activeTasks = allTasks.filter((t) => !t.is_completed);
  // Completed tasks are kept for today and removed after 1 day
  const completedTasks = allTasks.filter((t) => {
    if (!t.is_completed) return false;
    const d = t.due_date || t.event_date || (t.created_at ? format(new Date(t.created_at), 'yyyy-MM-dd') : todayStr);
    return d >= todayStr;
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Today Tasks
  const todayTasks = activeTasks.filter((t) => {
    const d = t.due_date || t.event_date;
    return d === todayStr;
  });

  const todayAllTasks = allTasks.filter((t) => {
    const d = t.due_date || t.event_date;
    return d === todayStr;
  });

  const todayCompletedCount = todayAllTasks.filter((t) => t.is_completed).length;
  const todayProgressPercentage = todayAllTasks.length > 0 ? Math.round((todayCompletedCount / todayAllTasks.length) * 100) : 0;

  // Upcoming Tasks
  const upcomingTasks = activeTasks.filter((t) => {
    const d = t.due_date || t.event_date;
    if (!d) return false;
    return d > todayStr;
  });

  // No Date Tasks
  const noDateTasks = activeTasks.filter((t) => !t.due_date && !t.event_date);

  const getOwnerName = (evt: CalendarEvent) => {
    if (evt.owner_user_id) {
      const owner = members.find((m) => m.user_id === evt.owner_user_id || m.id === evt.owner_user_id);
      if (owner) return owner.display_name;
    }
    if (evt.created_by) {
      const creator = members.find((m) => m.user_id === evt.created_by || m.id === evt.created_by);
      if (creator) return creator.display_name;
    }
    return 'Eve';
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const selectedCat = CATEGORY_TAGS.find((c) => c.label === newTaskCategory);
      await addEvent({
        title: newTaskText.trim(),
        event_type: 'task',
        event_date: newTaskDueDate || undefined,
        due_date: newTaskDueDate || undefined,
        emoji: selectedCat?.emoji || '📝',
        show_on_calendar: !!newTaskDueDate,
        is_completed: false,
      });

      setNewTaskText('');
      setNewTaskDueDate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const playCompletionSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Audio autoplay fallback
    }
  };

  const handleToggleTask = async (task: CalendarEvent) => {
    if (!task.is_completed) {
      playCompletionSound();
      // Fun Fireworks Confetti!
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'],
      });

      // Special grand celebration when all today's tasks are done!
      if (todayTasks.length === 1 && todayTasks[0].id === task.id) {
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 110,
            origin: { y: 0.5 },
          });
        }, 180);
      }
    }
    await toggleEventCompleted(task.id);
  };

  const renderTaskRow = (task: CalendarEvent) => {
    const isCompleted = task.is_completed;
    const dueDateStr = task.due_date || task.event_date;
    const ownerName = getOwnerName(task);

    const ownerStyle = ownerName === 'Eve'
      ? { bg: '#EFF6FF', color: '#1E40AF' }
      : { bg: '#FDF2F8', color: '#9D174D' };

    return (
      <div
        key={task.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.7rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderLeft: `3.5px solid ${task.color || '#F59E0B'}`,
          opacity: isCompleted ? 0.55 : 1,
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'translateZ(0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          {/* Checkbox with scale effect */}
          <button
            type="button"
            onClick={() => handleToggleTask(task)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isCompleted ? '#10B981' : 'var(--text-muted)',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.12s ease',
            }}
            title={isCompleted ? "Mark incomplete" : "Mark complete! 🎉"}
          >
            {isCompleted ? (
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
              }}>
                <Check size={14} strokeWidth={3} />
              </div>
            ) : (
              <Circle size={21} strokeWidth={1.8} />
            )}
          </button>

          {/* Task Title & Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flexWrap: 'wrap' }}>
            {task.emoji && <span style={{ fontSize: '0.9rem' }}>{task.emoji}</span>}

            <span style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}>
              {task.title}
            </span>

            {dueDateStr && (
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-hover)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}>
                <CalendarIcon size={10} /> {format(parseISO(dueDateStr), 'MMM d')}
              </span>
            )}

            {/* Owner badge ONLY shown when viewing persona filter "Both" */}
            {activePersonaFilter === 'all' && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                backgroundColor: ownerStyle.bg,
                color: ownerStyle.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}>
                <User size={9} /> {ownerName}
              </span>
            )}
          </div>
        </div>

        {/* Actions & Calendar ON/OFF Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {/* Per-Task Calendar ON / OFF Toggle */}
          <button
            type="button"
            onClick={() => updateEvent(task.id, { show_on_calendar: !(task.show_on_calendar !== false) })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              border: task.show_on_calendar !== false ? '1px solid #3B82F6' : '1px solid var(--border-color)',
              backgroundColor: task.show_on_calendar !== false ? '#EFF6FF' : 'var(--bg-hover)',
              color: task.show_on_calendar !== false ? '#1D4ED8' : 'var(--text-muted)',
              fontSize: '0.675rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.12s ease',
            }}
            title={task.show_on_calendar !== false ? "Turn OFF on Calendar" : "Turn ON on Calendar"}
          >
            <CalendarIcon size={10} />
            {task.show_on_calendar !== false ? 'Calendar ON' : 'Calendar OFF'}
          </button>

          {onEditTask && (
            <button
              type="button"
              onClick={() => onEditTask(task)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '3px',
                borderRadius: '4px',
              }}
              title="Edit Task"
            >
              <Edit3 size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => deleteEvent(task.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px',
              borderRadius: '4px',
            }}
            title="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.75rem',
      width: '100%',
      maxWidth: '740px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header with Fun Progress Progress Gauge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            To-Do List <Sparkles size={18} color="#F59E0B" />
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Tasks for Eve & Abbie' : `Tasks for ${activePersonaFilter}`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Master Toggle: Show To-Dos on Calendar */}
          <button
            type="button"
            onClick={() => setShowTodosOnCalendar(!showTodosOnCalendar)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '999px',
              border: showTodosOnCalendar ? '1.5px solid #3B82F6' : '1px solid var(--border-color)',
              backgroundColor: showTodosOnCalendar ? '#EFF6FF' : 'var(--bg-hover)',
              color: showTodosOnCalendar ? '#1D4ED8' : 'var(--text-muted)',
              fontSize: '0.775rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: showTodosOnCalendar ? '0 2px 8px rgba(59, 130, 246, 0.15)' : 'none',
            }}
            title="Turn ON or OFF displaying to-do tasks on the main Calendar view"
          >
            <CalendarIcon size={14} />
            {showTodosOnCalendar ? 'Calendar Sync: ON' : 'Calendar Sync: OFF'}
          </button>
        </div>
      </div>

      {/* Motivational Celebration Banner if Today's Tasks Complete */}
      {todayAllTasks.length > 0 && todayTasks.length === 0 && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#065F46',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.875rem',
          fontWeight: 700,
        }}>
          <Flame size={20} color="#10B981" />
          <span>All today's tasks completed! You're crushing it today! 🎉</span>
        </div>
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleQuickAdd} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
        marginBottom: '1.75rem',
        backgroundColor: 'var(--bg-primary)',
        padding: '0.85rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            placeholder="+ What do you need to get done?"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            style={{ flex: 1, minWidth: '220px', fontSize: '0.9rem' }}
          />

          <input
            type="date"
            className="input-field"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
            title="Due Date (optional)"
          />

          <select
            className="input-field"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            style={{ width: 'auto', minWidth: '110px' }}
          >
            {CATEGORY_TAGS.map((c) => (
              <option key={c.label} value={c.label}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || !newTaskText.trim()}
            style={{ padding: '0.55rem 1rem', fontSize: '0.825rem' }}
          >
            <Plus size={15} /> Add Task
          </button>
        </div>
      </form>

      {/* Task Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* TODAY */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Today ({todayTasks.length})
            </h3>
          </div>

          {todayTasks.length === 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>
              No tasks due today.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {todayTasks.map(renderTaskRow)}
            </div>
          )}
        </div>

        {/* UPCOMING */}
        <div>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Upcoming ({upcomingTasks.length})
          </h3>
          {upcomingTasks.length === 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.25rem 0' }}>
              No upcoming tasks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {upcomingTasks.map(renderTaskRow)}
            </div>
          )}
        </div>

        {/* NO DATE */}
        {noDateTasks.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
              No Date ({noDateTasks.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {noDateTasks.map(renderTaskRow)}
            </div>
          </div>
        )}

        {/* COMPLETED (COLLAPSED BY DEFAULT) */}
        {completedTasks.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsCompletedOpen(!isCompletedOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: isCompletedOpen ? '0.65rem' : 0,
                padding: 0,
              }}
            >
              {isCompletedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <CheckCircle2 size={13} color="#10B981" /> Completed ({completedTasks.length})
            </button>

            {isCompletedOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {completedTasks.map(renderTaskRow)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
