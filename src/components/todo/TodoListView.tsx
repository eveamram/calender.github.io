import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Trash2, Calendar as CalendarIcon, Eye, EyeOff, Edit3, User, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodoListViewProps {
  onOpenAddEvent?: () => void;
  onEditTask?: (task: CalendarEvent) => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({ onOpenAddEvent, onEditTask }) => {
  const { filteredEvents, members, toggleEventCompleted, deleteEvent, updateEvent, addEvent, activePersonaFilter, setActivePersonaFilter } = useCalendar();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskShowOnCalendar, setNewTaskShowOnCalendar] = useState(false);

  // Filter unified events strictly for tasks
  const allTasks = filteredEvents.filter((evt) => evt.event_type === 'task');

  const activeTasks = allTasks.filter((t) => !t.is_completed);
  const completedTasks = allTasks.filter((t) => t.is_completed);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Today tasks
  const todayTasks = activeTasks.filter((t) => {
    const d = t.event_date || t.due_date;
    return d === todayStr;
  });

  const todayAllTasks = allTasks.filter((t) => {
    const d = t.event_date || t.due_date;
    return d === todayStr;
  });

  const todayCompletedCount = todayAllTasks.filter((t) => t.is_completed).length;

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

    await addEvent({
      title: newTaskText.trim(),
      event_type: 'task',
      event_date: newTaskDueDate || undefined,
      due_date: newTaskDueDate || undefined,
      show_on_calendar: newTaskShowOnCalendar,
      is_completed: false,
    });

    setNewTaskText('');
    setNewTaskDueDate('');
  };

  const handleToggleTask = async (task: CalendarEvent) => {
    if (!task.is_completed) {
      // Confetti burst on completion!
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
      if (todayTasks.length === 1 && todayTasks[0].id === task.id) {
        // Extra celebration when all today's tasks are complete!
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 } });
        }, 250);
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
      ownerName === 'Eve' ? { bg: '#EFF6FF', color: '#1E40AF' } :
      { bg: '#FDF2F8', color: '#9D174D' };

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
          backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)',
          opacity: isCompleted ? 0.55 : 1,
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
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
            }}
          >
            {isCompleted ? (
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={13} strokeWidth={3} />
              </div>
            ) : (
              <Circle size={20} />
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}>
              {task.title}
            </span>

            {dueDateStr && (
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <CalendarIcon size={11} /> {format(parseISO(dueDateStr), 'MMM d')}
              </span>
            )}

            {/* Owner Badge rendered ONLY when persona filter is set to "Both" */}
            {activePersonaFilter === 'all' && (
              <span style={{
                fontSize: '0.675rem',
                fontWeight: 800,
                padding: '0.1rem 0.45rem',
                borderRadius: '999px',
                backgroundColor: ownerStyle.bg,
                color: ownerStyle.color,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}>
                <User size={10} /> {ownerName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Specific Show/Hide on Calendar Toggle */}
          <button
            type="button"
            onClick={() => handleToggleShowOnCalendar(task)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '0.2rem 0.45rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: isShownOnCalendar ? '#EFF6FF' : 'transparent',
              color: isShownOnCalendar ? '#2563EB' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title={isShownOnCalendar ? "Shown on Calendar (click to hide)" : "Hidden from Calendar (click to show)"}
          >
            {isShownOnCalendar ? <Eye size={12} /> : <EyeOff size={12} />}
            {isShownOnCalendar ? 'On Cal' : 'Off Cal'}
          </button>

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
              <Edit3 size={14} />
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
      padding: '1.5rem 1.75rem',
      width: '100%',
      maxWidth: '780px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Minimal Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {activePersonaFilter === 'all' ? 'To-Do List' : `${activePersonaFilter}'s Tasks`}
          </h2>
          {todayCompletedCount > 0 && (
            <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
              <Sparkles size={13} /> {todayCompletedCount} task{todayCompletedCount > 1 ? 's' : ''} accomplished today!
            </span>
          )}
        </div>

        {/* Persona Selector (Eve -> Abbie -> Both) */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-hover)',
          padding: '2px',
          borderRadius: '999px',
          border: '1px solid var(--border-color)',
        }}>
          {(['Eve', 'Abbie', 'all'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setActivePersonaFilter(p)}
              style={{
                padding: '0.3rem 0.85rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: activePersonaFilter === p
                  ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                  : 'transparent',
                color: activePersonaFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.775rem',
                cursor: 'pointer',
                transition: 'all 0.12s ease',
              }}
            >
              {p === 'all' ? 'Both' : p}
            </button>
          ))}
        </div>
      </div>

      {/* Clean Quick Add Input */}
      <form onSubmit={handleQuickAdd} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          className="input-field"
          placeholder="New task..."
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />

        <input
          type="date"
          className="input-field"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          style={{ width: 'auto', minWidth: '125px' }}
          title="Due Date (optional)"
        />

        <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.825rem' }}>
          <Plus size={15} /> Add
        </button>
      </form>

      {/* All Today's Tasks Completed Banner */}
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
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 700,
        }}>
          <Sparkles size={18} color="#10B981" /> All tasks completed for today! Awesome job! 🎉
        </div>
      )}

      {/* Clean Task Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Today Section */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Today ({todayTasks.length})
          </div>
          {todayTasks.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.3rem 0' }}>
              No remaining tasks for today!
            </div>
          ) : (
            <div>{todayTasks.map(renderTaskItem)}</div>
          )}
        </div>

        {/* Upcoming Section */}
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
            Upcoming ({upcomingTasks.length})
          </div>
          {upcomingTasks.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.3rem 0' }}>
              No upcoming tasks.
            </div>
          ) : (
            <div>{upcomingTasks.map(renderTaskItem)}</div>
          )}
        </div>

        {/* No Date Section */}
        {noDateTasks.length > 0 && (
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Someday ({noDateTasks.length})
            </div>
            <div>{noDateTasks.map(renderTaskItem)}</div>
          </div>
        )}

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.4rem' }}>
              Completed ({completedTasks.length})
            </div>
            <div>{completedTasks.map(renderTaskItem)}</div>
          </div>
        )}
      </div>
    </div>
  );
};
