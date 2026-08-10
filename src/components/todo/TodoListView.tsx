import React, { useState } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { CalendarEvent } from '../../types';
import { format, parseISO } from 'date-fns';
import { Plus, CheckCircle2, Circle, Trash2, CheckSquare, ChevronDown, ChevronRight, Calendar as CalendarIcon, Eye, EyeOff, Edit3 } from 'lucide-react';

interface TodoListViewProps {
  onOpenAddEvent?: () => void;
  onEditTask?: (task: CalendarEvent) => void;
}

export const TodoListView: React.FC<TodoListViewProps> = ({ onOpenAddEvent, onEditTask }) => {
  const { filteredEvents, toggleEventCompleted, deleteEvent, updateEvent, addEvent, activePersonaFilter, setActivePersonaFilter } = useCalendar();

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [newTaskShowOnCalendar, setNewTaskShowOnCalendar] = useState(true);
  const [showCompletedSection, setShowCompletedSection] = useState(false);

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

  // Upcoming tasks
  const upcomingTasks = activeTasks.filter((t) => {
    const d = t.event_date || t.due_date;
    if (!d) return false;
    return d > todayStr;
  });

  // No Date tasks
  const noDateTasks = activeTasks.filter((t) => !t.event_date && !t.due_date);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    await addEvent({
      title: newTaskText.trim(),
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

  const handleToggleShowOnCalendar = (task: CalendarEvent) => {
    const currentVal = task.show_on_calendar !== false;
    updateEvent(task.id, { show_on_calendar: !currentVal });
  };

  const renderTaskItem = (task: CalendarEvent) => {
    const isCompleted = task.is_completed;
    const dueDateStr = task.event_date || task.due_date;
    const isShownOnCalendar = task.show_on_calendar !== false;

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
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          opacity: isCompleted ? 0.6 : 1,
          transition: 'all 0.12s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => toggleEventCompleted(task.id)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCompleted ? '#10B981' : 'var(--text-muted)', padding: 0 }}
          >
            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: isCompleted ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {task.title}
            </span>

            {dueDateStr && (
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CalendarIcon size={11} /> Due {format(parseISO(dueDateStr), 'MMM d, yyyy')}
              </span>
            )}
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
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: isShownOnCalendar ? '#EFF6FF' : 'var(--bg-hover)',
              color: isShownOnCalendar ? '#2563EB' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title={isShownOnCalendar ? "Shown on Calendar (click to hide)" : "Hidden from Calendar (click to show)"}
          >
            {isShownOnCalendar ? <Eye size={12} /> : <EyeOff size={12} />}
            {isShownOnCalendar ? 'On Calendar' : 'Off Calendar'}
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
      padding: '1.5rem',
      width: '100%',
      maxWidth: '820px',
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
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#F59E0B' }}>
            <CheckSquare size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              To-Do List
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'All Tasks' : `${activePersonaFilter}'s Tasks`}
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

      {/* Quick Add Inline Form */}
      <form onSubmit={handleQuickAdd} style={{
        display: 'flex',
        gap: '0.6rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          className="input-field"
          placeholder="Add a task..."
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={newTaskShowOnCalendar}
            onChange={(e) => setNewTaskShowOnCalendar(e.target.checked)}
          />
          On Calendar
        </label>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.1rem' }}>
          <Plus size={16} /> Add Task
        </button>
      </form>

      {/* Task Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Today Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            Today ({todayTasks.length})
          </h3>
          {todayTasks.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
              No tasks due today.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todayTasks.map(renderTaskItem)}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        <div>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            Upcoming ({upcomingTasks.length})
          </h3>
          {upcomingTasks.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
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
          <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
            No Date ({noDateTasks.length})
          </h3>
          {noDateTasks.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '0.4rem 0' }}>
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
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
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
                marginBottom: showCompletedSection ? '0.6rem' : 0,
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
