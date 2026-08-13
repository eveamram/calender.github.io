import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { BottomSheet } from '../ui/BottomSheet';
import { FileText, Plus, Trash2, Edit3, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  owner: 'Eve' | 'Abbie' | 'Both';
  updatedAt: string;
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: '1',
    title: 'Fall Semester Course Goals',
    content: '1. Maintain a 3.8+ GPA in Engineering & Math\n2. Complete weekly calculus problem sets early\n3. Chemistry lab reports done by Thursday nights',
    owner: 'Both',
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Study Tips & Exam prep',
    content: 'Pomodoro method (50 mins study / 10 mins break). Active recall using Anki flashcards for bio & chem.',
    owner: 'Eve',
    updatedAt: new Date().toISOString(),
  },
];

export const NotesView: React.FC = () => {
  const { activePersonaFilter } = useCalendar();
  const [notes, setNotes] = useState<NoteItem[]>(() => {
    const saved = localStorage.getItem('calender_notes_list_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed parsing notes', e);
      }
    }
    return DEFAULT_NOTES;
  });

  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    localStorage.setItem('calender_notes_list_v1', JSON.stringify(notes));
    window.dispatchEvent(new Event('storage'));
  }, [notes]);

  const handleOpenNote = (note: NoteItem) => {
    setActiveNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      owner: activePersonaFilter === 'all' ? 'Both' : activePersonaFilter,
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    handleOpenNote(newNote);
  };

  const handleSaveNote = () => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? {
              ...n,
              title: editTitle.trim() || 'Untitled Note',
              content: editContent,
              updatedAt: new Date().toISOString(),
            }
          : n
      )
    );
    setIsEditing(false);
    setActiveNote(null);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (activeNote?.id === id) {
      setIsEditing(false);
      setActiveNote(null);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter((n) => {
    if (activePersonaFilter !== 'all' && n.owner !== activePersonaFilter && n.owner !== 'Both') {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      paddingBottom: '5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <div>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}>
            Notes <FileText size={20} color="#8B5CF6" />
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {activePersonaFilter === 'all' ? 'Shared notebook for Eve & Abbie' : `Notebook for ${activePersonaFilter}`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNote}
          style={{
            padding: '0.55rem 0.95rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#8B5CF6',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Search Input Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-secondary)',
        padding: '0.55rem 0.9rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        marginBottom: '1.25rem',
        boxShadow: 'var(--shadow-subtle)',
      }}>
        <FileText size={15} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search notes by title or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        />
      </div>

      {/* Notes Card List */}
      {filteredNotes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}>
          No notes created yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenNote(note)}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '1.1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {note.title}
                </span>

                {note.owner !== 'Both' && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    color: note.owner === 'Eve' ? '#EC4899' : '#3B82F6',
                    backgroundColor: 'var(--bg-hover)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {note.owner}
                  </span>
                )}
              </div>

              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                margin: 0,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
              }}>
                {note.content || 'Empty note...'}
              </p>

              <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Edited {format(new Date(note.updatedAt), 'MMM d, h:mm a')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Note Full Sheet Editor */}
      <BottomSheet
        isOpen={isEditing}
        onClose={handleSaveNote}
        title={activeNote ? 'Edit Note' : 'New Note'}
        maxHeight="92vh"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <input
            type="text"
            placeholder="Note title..."
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.9rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              fontWeight: 800,
              outline: 'none',
            }}
          />

          <textarea
            placeholder="Write your notes here..."
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.925rem',
              lineHeight: 1.5,
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => activeNote && handleDeleteNote(activeNote.id)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Trash2 size={16} /> Delete
            </button>

            <button
              type="button"
              onClick={handleSaveNote}
              style={{
                padding: '0.65rem 1.4rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
