import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, parseISO } from 'date-fns';
import {
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  Edit3,
  Flame,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodoListViewProps {
  onOpenAddEvent?: () => void;
  onEditTask?: (task: CalendarEvent) => void;
}

const FUN_TAGS = [
  { label: 'Homework', emoji: '📚', color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Goals', emoji: '🎯', color: '#EF4444', bg: '#FEF2F2' },
  { label: 'Fun', emoji: '🍿', color: '#EC4899', bg: '#FDF2F8' },
  { label: 'Shopping', emoji: '🛍️', color: '#10B981', bg: '#ECFDF5' },
  { label: 'Quick Win', emoji: '⚡', color: '#F59E0B', bg: '#FFFBEB' },
];

export const TodoListView: React.FC<TodoListViewProps> = ({ onOpenAddEvent, onEditTask }) => {
  const { filteredEvents, members, toggleEventCompleted, deleteEvent, updateEvent, addEvent, activePersonaFilter, setActivePersonaFilter } = useCalendar();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [newTaskTag, setNewTaskTag] = useState('Homework');
  const [newTaskShowOnCalendar, setNewTaskShowOnCalendar] = useState(false);
  const [showCompletedSection, setShowCompletedSection] = useState(false);

  // Filter unified events strictly for tasks
  const allTasks = filteredEvents.filter((evt) => evt.event_type === 'task');

  const activeTasks = allTasks.filter((t) => !t.is_completed);
  const completedTasks = allTasks.filter((t) => t.is_completed);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Today tasks
  const todayTasks = allTasks.filter((t) => {
    const d = t.event_date || t.due_date;
    return d === todayStr;
  });

  const todayActive = todayTasks.filter((t) => !t.is_completed);
  const todayCompleted = todayTasks.filter((t) => t.is_completed);
  const completionRate = todayTasks.length > 0 ? Math.round((todayCompleted.length / todayTasks.length) * 100) : 0;

  // Upcoming tasks
  const upcomingTasks = activeTasks.filter((t) => {
    const d = t.event_date || t.due_date;
    if (!d) return false;
    return d > todayStr;
  });

  // No Date tasks
  const noDateTasks = activeTasks.filter((t) => !t.event_date && !t.due_date);

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
    if (!newTaskText.trim()) return;

    const matchedTag = FUN_TAGS.find((t) => t.label === newTaskTag);

    await addEvent({
      title: `${matchedTag ? matchedTag.emoji : '📝'} ${newTaskText.trim()}`,
      event_type: 'task',
      event_date: newTaskDueDate || undefined,
      due_date: newTaskDueDate || undefined,
      priority: newTaskPriority,
      show_on_calendar: newTaskShowOnCalendar,
      is_completed: false,
    });

    setNewTaskText('');
    setNewTaskDueDate('');
  };

  const handleToggleTask = async (task: CalendarEvent) => {
    if (!task.is_completed) {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      if (todayActive.length === 1 && todayActive[0].id === task.id) {
        // All tasks done celebration!
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
        }, 300);
      }
    }
    await toggleEventCompleted(task.id);
  };

  const handleToggleShowOnCalendar = (task: CalendarEvent) => {
    const currentVal = task.show_on_calendar !== false;
    updateEvent(task.id, { show_on_calendar: !currentVal });
  };

  const renderTaskItem = (task: CalendarEvent) => {
    const isCompleted = task.is_completed;
    const dueDateStr = task.event_date || task.due_date;
    const isShownOnCalendar = task.show_on_calendar !== false;
    const ownerName = getOwnerName(task);

    const ownerStyle =
      ownerName === 'Eve' ? { bg: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' } :
      { bg: '#FDF2F8', color: '#9D174D', border: '1px solid #FBCFE8' };

    const priorityBadge =
      task.priority === 'high' ? { label: 'High', color: '#EF4444', bg: '#FEF2F2' } :
      task.priority === 'low' ? { label: 'Low', color: '#10B981', bg: '#ECFDF5' } :
      { label: 'Normal', color: '#3B82F6', bg: '#EFF6FF' };

    return (
      <div
        key={task.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          boxShadow: isCompleted ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
          opacity: isCompleted ? 0.6 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => handleToggleTask(task)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCompleted ? '#10B981' : 'var(--text-muted)', padding: 0 }}
          >
            {isCompleted ? <CheckCircle2 size={22} color="#10B981" /> : <Circle size={22} />}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
            <span style={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {task.title}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {dueDateStr && (
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CalendarIcon size={11} /> Due {format(parseISO(dueDateStr), 'MMM d, yyyy')}
                </span>
              )}

              {/* Owner Badge (Rendered ONLY when persona filter is set to "Both") */}
              {activePersonaFilter === 'all' && (
                <span style={{
                  fontSize: '0.675rem',
                  fontWeight: 800,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  backgroundColor: ownerStyle.bg,
                  color: ownerStyle.color,
                  border: ownerStyle.border,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}>
                  <User size={10} /> {ownerName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Specific Show/Hide on Calendar Toggle */}
          <button
            type="button"
            onClick={() => handleToggleShowOnCalendar(task)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0.25rem 0.55rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isShownOnCalendar ? '#EFF6FF' : 'var(--bg-hover)',
              color: isShownOnCalendar ? '#2563EB' : 'var(--text-muted)',
              fontSize: '0.725rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title={isShownOnCalendar ? "Shown on Calendar (click to hide)" : "Hidden from Calendar (click to show)"}
          >
            {isShownOnCalendar ? <Eye size={13} /> : <EyeOff size={13} />}
            {isShownOnCalendar ? 'On Cal' : 'Off Cal'}
          </button>

          {/* Priority Badge */}
          <span style={{
            fontSize: '0.725rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: '6px',
            backgroundColor: priorityBadge.bg,
            color: priorityBadge.color,
          }}>
            {priorityBadge.label}
          </span>

          {/* Edit Task Button */}
          {onEditTask && (
            <button
              type="button"
              onClick={() => onEditTask(task)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
              }}
              title="Edit Task"
            >
              <Edit3 size={15} />
            </button>
          )}

          {/* Delete Task Button */}
          <button
            type="button"
            onClick={() => deleteEvent(task.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
            }}
            title="Delete Task"
          >
            <Trash2 size={16} />
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
      maxWidth: '860px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Daily Quest
            </span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Eve & Abbie To-Dos' : `${activePersonaFilter}'s To-Do List`}
          </h2>
        </div>

        {/* Persona Selector (Eve -> Abbie -> Both) */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-hover)',
          padding: '3px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
        }}>
          {(['Eve', 'Abbie', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePersonaFilter(p)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersonaFilter === p
                  ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                  : 'transparent',
                color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p === 'all' ? 'Both' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Progress & Streak Card */}
      <div style={{
        background: 'linear-gradient(135deg, #EFF6FF 0%, #FDF2F8 100%)',
        border: '1px solid #DBEAFE',
        borderRadius: 'var(--radius-md)',
        padding: '1.1rem 1.25rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={20} color="#F59E0B" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A' }}>
              Today's Streak: {todayCompleted.length}/{todayTasks.length} Completed
            </span>
          </div>

          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#2563EB' }}>
            {completionRate}%
          </span>
        </div>

        {/* Animated Progress Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#DBEAFE',
          borderRadius: '999px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${completionRate}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6 0%, #EC4899 100%)',
            borderRadius: '999px',
            transition: 'width 0.4s ease-in-out',
          }} />
        </div>

        {completionRate === 100 && todayTasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.65rem', fontSize: '0.825rem', fontWeight: 800, color: '#059669' }}>
            <Trophy size={15} /> All tasks completed today! You're crushing it! 🎉
          </div>
        )}
      </div>

      {/* Fun Quick Add Form */}
      <form onSubmit={handleQuickAdd} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1.75rem',
        backgroundColor: 'var(--bg-primary)',
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Add a new task..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            style={{ flex: 1, minWidth: '220px' }}
          />

          <input
            type="date"
            className="input-field"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
            style={{ width: 'auto', minWidth: '130px' }}
            title="Due Date (optional)"
          />

          <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
            <Plus size={16} /> Add Task
          </button>
        </div>

        {/* Fun Emoji Tag Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tag:</span>
          {FUN_TAGS.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => setNewTaskTag(tag.label)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '999px',
                border: newTaskTag === tag.label ? `2px solid ${tag.color}` : '1px solid var(--border-color)',
                backgroundColor: newTaskTag === tag.label ? tag.bg : 'transparent',
                color: tag.color,
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {tag.emoji} {tag.label}
            </button>
          ))}

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 'auto' }}>
            <input
              type="checkbox"
              checked={newTaskShowOnCalendar}
              onChange={(e) => setNewTaskShowOnCalendar(e.target.checked)}
            />
            Show on Calendar
          </label>
        </div>
      </form>

      {/* Task Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Today Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            Today ({todayActive.length})
          </h3>
          {todayActive.length === 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No remaining tasks for today! ✨
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todayActive.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            Upcoming ({upcomingTasks.length})
          </h3>
          {upcomingTasks.length === 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No upcoming tasks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {upcomingTasks.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* No Date Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
            Unscheduled ({noDateTasks.length})
          </h3>
          {noDateTasks.length === 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.5rem 0' }}>
              No unscheduled tasks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {noDateTasks.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* Completed Section (Collapsible) */}
        {completedTasks.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => setShowCompletedSection(!showCompletedSection)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                marginBottom: showCompletedSection ? '0.65rem' : 0,
              }}
            >
              {showCompletedSection ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Completed ({completedTasks.length})
            </button>

            {showCompletedSection && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completedTasks.map(renderTaskItem)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
