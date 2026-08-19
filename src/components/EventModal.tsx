import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, User, Tag, FileText, Check, AlertTriangle } from 'lucide-react';
import { CalendarEvent, EventCategory, CATEGORY_COLORS, CreateEventPayload } from '../types/event';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Create a brand-new event */
  onSave: (payload: CreateEventPayload) => Promise<void>;
  /** Update an existing event. Caller handles ConflictError. */
  onUpdate: (id: string, expectedVersion: number, updates: Partial<CalendarEvent>, editedBy: string) => Promise<void>;
  /** Delete an existing event. Caller handles ConflictError. */
  onDelete: (id: string, expectedVersion: number) => Promise<void>;
  selectedEvent: CalendarEvent | null;
  initialStart?: string;
  initialEnd?: string;
  currentUserName: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  selectedEvent,
  initialStart,
  initialEnd,
  currentUserName,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Work');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(selectedEvent);
  /** The version the user loaded — used for conflict detection on save */
  const loadedVersion = selectedEvent?.version ?? 1;

  // Populate form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setCategory(selectedEvent.category);
      setStart(selectedEvent.start.slice(0, 16));
      setEnd(selectedEvent.end.slice(0, 16));
      setDescription(selectedEvent.description || '');
    } else {
      setTitle('');
      setCategory('Work');
      const ds = initialStart
        ? initialStart.length === 10 ? `${initialStart}T09:00` : initialStart.slice(0, 16)
        : new Date().toISOString().slice(0, 16);
      const de = initialEnd
        ? initialEnd.length === 10 ? `${initialEnd}T10:00` : initialEnd.slice(0, 16)
        : new Date(Date.now() + 3_600_000).toISOString().slice(0, 16);
      setStart(ds);
      setEnd(de);
      setDescription('');
    }
    setErrorMsg('');
  }, [isOpen, selectedEvent, initialStart, initialEnd]);

  if (!isOpen) return null;

  const color = CATEGORY_COLORS[category].hex;

  // -----------------------------------------------------------------------
  // Submit handler
  // -----------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErrorMsg('Title is required.'); return; }
    if (new Date(end) <= new Date(start)) { setErrorMsg('End must be after start.'); return; }

    setSubmitting(true);
    setErrorMsg('');
    try {
      if (isEditing && selectedEvent) {
        await onUpdate(
          selectedEvent.id,
          loadedVersion,
          { title, category, color, start, end, description },
          currentUserName
        );
      } else {
        await onSave({ title, category, color, start, end, description, createdBy: currentUserName });
      }
      onClose();
    } catch (err: any) {
      if (err.name === 'ConflictError') {
        setErrorMsg(
          `⚠️ Conflict: "${selectedEvent?.title}" was changed by ${err.latestEvent?.lastEditedBy || 'someone else'} while you were editing. Your changes were NOT saved. Close this modal and try again to see the latest version.`
        );
      } else {
        setErrorMsg(err.message || 'Failed to save.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Delete handler
  // -----------------------------------------------------------------------
  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Delete "${selectedEvent.title}"?`)) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await onDelete(selectedEvent.id, loadedVersion);
      onClose();
    } catch (err: any) {
      if (err.name === 'ConflictError') {
        setErrorMsg(
          `⚠️ Conflict: This event was modified by someone else. It was NOT deleted. Close this modal and review the latest version.`
        );
      } else {
        setErrorMsg(err.message || 'Delete failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {isEditing ? 'Edit Event' : 'New Event'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error / Conflict banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Metadata for existing events */}
          {isEditing && selectedEvent && (
            <div className="text-[11px] text-slate-500 space-y-0.5 bg-slate-50 rounded-lg p-3 border border-slate-200/80">
              <div>Created by <strong className="text-slate-700">{selectedEvent.createdBy}</strong></div>
              <div>Last edited by <strong className="text-slate-700">{selectedEvent.lastEditedBy}</strong></div>
              <div>Version <strong className="text-slate-700">v{selectedEvent.version}</strong></div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Sprint Planning" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-sm font-semibold text-slate-800 placeholder:text-slate-400" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-400" /> Category</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_COLORS) as EventCategory[]).map((cat) => (
                <button key={cat} type="button" onClick={() => setCategory(cat)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    category === cat
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat].hex }} />
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Start / End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Start</label>
              <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-semibold text-slate-800" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> End</label>
              <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-semibold text-slate-800" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional notes…" className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs text-slate-800 placeholder:text-slate-400" />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isEditing ? (
              <button type="button" onClick={handleDelete} disabled={submitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
              <button type="submit" disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50">
                <Check className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
