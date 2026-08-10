import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, CheckCircle2, Circle, Trash2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface TodoItem {
  id: string;
  owner: 'Eve' | 'Abbie';
  text: string;
  priority: 'high' | 'normal' | 'low';
  is_completed: boolean;
  created_at: string;
}

export const TodoListView: React.FC = () => {
  const { userProfile } = useAuth();
  const activePersona = (userProfile?.display_name as 'Eve' | 'Abbie') || 'Eve';

  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem('calender_todos');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { id: '1', owner: 'Eve', text: 'Submit Bio Lab Report', priority: 'high', is_completed: false, created_at: new Date().toISOString() },
      { id: '2', owner: 'Eve', text: 'Buy textbooks for semester', priority: 'normal', is_completed: true, created_at: new Date().toISOString() },
      { id: '3', owner: 'Abbie', text: 'Math 202 Problem Set 3', priority: 'high', is_completed: false, created_at: new Date().toISOString() },
      { id: '4', owner: 'Abbie', text: 'Schedule study group meeting', priority: 'low', is_completed: false, created_at: new Date().toISOString() },
    ];
  });

  const [selectedOwnerFilter, setSelectedOwnerFilter] = useState<'Eve' | 'Abbie' | 'all'>(activePersona);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'normal' | 'low'>('normal');

  // Automatically update view filter when active persona is clicked in header
  useEffect(() => {
    if (activePersona === 'Eve' || activePersona === 'Abbie') {
      setSelectedOwnerFilter(activePersona);
    }
  }, [activePersona]);

  useEffect(() => {
    localStorage.setItem('calender_todos', JSON.stringify(todos));
  }, [todos]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    const newItem: TodoItem = {
      id: Date.now().toString(),
      owner: activePersona,
      text: newText.trim(),
      priority: newPriority,
      is_completed: false,
      created_at: new Date().toISOString(),
    };

    setTodos((prev) => [newItem, ...prev]);
    setNewText('');
  };

  const handleToggleComplete = (id: string, isCompleted: boolean) => {
    if (!isCompleted) {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }

    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_completed: !isCompleted } : t))
    );
  };

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTodos = todos.filter((t) => {
    if (selectedOwnerFilter === 'all') return true;
    return t.owner === selectedOwnerFilter;
  });

  const activeCount = filteredTodos.filter((t) => !t.is_completed).length;
  const completedCount = filteredTodos.filter((t) => t.is_completed).length;

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      boxShadow: 'var(--shadow-subtle)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header & Sleek Persona Selector */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={18} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Personal To-Do List
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
            {selectedOwnerFilter === 'all' ? 'Shared Tasks' : `${selectedOwnerFilter}'s Tasks`}
          </h2>
        </div>

        {/* Sleek Modern Persona Selector (Eve -> Abbie -> Both) */}
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
              onClick={() => setSelectedOwnerFilter(p)}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: selectedOwnerFilter === p
                  ? (p === 'Eve' ? '#3B82F6' : p === 'Abbie' ? '#EC4899' : 'var(--text-primary)')
                  : 'transparent',
                color: selectedOwnerFilter === p ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {p === 'Eve' ? '🔵 Eve' : p === 'Abbie' ? '💗 Abbie' : '👥 Both'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAddTodo} style={{
        display: 'flex',
        gap: '0.6rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          className="input-field"
          placeholder={`Add a task for ${activePersona}...`}
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          style={{ flex: 1, minWidth: '220px' }}
        />

        {/* Priority Selector */}
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as 'high' | 'normal' | 'low')}
          className="input-field"
          style={{ width: 'auto', minWidth: '110px' }}
        >
          <option value="high">🔥 High</option>
          <option value="normal">⭐ Normal</option>
          <option value="low">🍃 Low</option>
        </select>

        <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.1rem' }}>
          <Plus size={16} /> Add Task
        </button>
      </form>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {filteredTodos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 0',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontStyle: 'italic',
          }}>
            No tasks listed! All caught up 🎉
          </div>
        ) : (
          filteredTodos.map((todo) => {
            const isCompleted = todo.is_completed;
            const priorityBadge =
              todo.priority === 'high' ? { label: 'High', color: '#EF4444', bg: '#FEF2F2' } :
              todo.priority === 'low' ? { label: 'Low', color: '#10B981', bg: '#ECFDF5' } :
              { label: 'Normal', color: '#3B82F6', bg: '#EFF6FF' };

            return (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCompleted ? 'var(--bg-hover)' : 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  opacity: isCompleted ? 0.65 : 1,
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(todo.id, isCompleted)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: isCompleted ? '#10B981' : 'var(--text-muted)', padding: 0 }}
                  >
                    {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>

                  <span style={{
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    textDecoration: isCompleted ? 'line-through' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {todo.text}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {/* Persona Badge */}
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '999px',
                    backgroundColor: todo.owner === 'Eve' ? '#DBEAFE' : '#FCE7F3',
                    color: todo.owner === 'Eve' ? '#1E40AF' : '#9D174D',
                  }}>
                    {todo.owner}
                  </span>

                  {/* Priority Badge */}
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    backgroundColor: priorityBadge.bg,
                    color: priorityBadge.color,
                  }}>
                    {priorityBadge.label}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(todo.id)}
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
          })
        )}
      </div>

      {/* Footer stats */}
      <div style={{
        marginTop: '1.25rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
      }}>
        <span>{activeCount} tasks remaining</span>
        <span>{completedCount} completed</span>
      </div>
    </div>
  );
};
