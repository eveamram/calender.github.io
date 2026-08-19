import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar as CalendarIcon, Clock, User, Tag, FileText, Check } from 'lucide-react';
import { CalendarEvent, EventCategory, CATEGORY_COLORS, NewCalendarEventPayload } from '../types/event';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: NewCalendarEventPayload) => Promise<void>;
  onUpdate: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  selectedEvent: CalendarEvent | null;
  initialStart?: string;
  initialEnd?: string;
  currentUserName: string;
}

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
  const [color, setColor] = useState(CATEGORY_COLORS.Work.hex);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [description, setDescription] = useState('');
  const [createdBy, setCreatedBy] = useState(currentUserName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEditing = Boolean(selectedEvent);

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setCategory(selectedEvent.category);
      setColor(selectedEvent.color || CATEGORY_COLORS[selectedEvent.category]?.hex || '#3B82F6');
      setStart(selectedEvent.start ? selectedEvent.start.slice(0, 16) : '');
      setEnd(selectedEvent.end ? selectedEvent.end.slice(0, 16) : '');
      setDescription(selectedEvent.description || '');
      setCreatedBy(selectedEvent.createdBy || currentUserName);
    } else {
      // Create mode
      setTitle('');
      setCategory('Work');
      setColor(CATEGORY_COLORS.Work.hex);
      const defaultStart = initialStart
        ? initialStart.length === 10
          ? `${initialStart}T09:00`
          : initialStart.slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      const defaultEnd = initialEnd
        ? initialEnd.length === 10
          ? `${initialEnd}T10:00`
          : initialEnd.slice(0, 16)
        : new Date(Date.now() + 3600000).toISOString().slice(0, 16);

      setStart(defaultStart);
      setEnd(defaultEnd);
      setDescription('');
      setCreatedBy(currentUserName);
    }
    setErrorMsg('');
  }, [selectedEvent, initialStart, initialEnd, currentUserName, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat: EventCategory) => {
    setCategory(cat);
    setColor(CATEGORY_COLORS[cat].hex);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an event title.');
      return;
    }

    if (new Date(end) <= new Date(start)) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      if (isEditing && selectedEvent) {
        await onUpdate(selectedEvent.id, {
          title,
          category,
          color,
          start,
          end,
          description,
          createdBy,
        });
      } else {
        await onSave({
          title,
          category,
          color,
          start,
          end,
          description,
          createdBy: createdBy || currentUserName || 'Anonymous',
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!window.confirm(`Are you sure you want to delete "${selectedEvent.title}"?`)) return;

    try {
      setIsSubmitting(true);
      await onDelete(selectedEvent.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-modal-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
              {isEditing ? 'Edit Event Details' : 'Create New Event'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Event Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Demo & Sync"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-sm text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Category Selector & Color */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Category & Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_COLORS) as EventCategory[]).map((cat) => {
                const isSelected = category === cat;
                const catColor = CATEGORY_COLORS[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? `${catColor.bg} ${catColor.border} ${catColor.text} shadow-xs ring-2 ring-blue-400/30`
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: catColor.hex }}
                    />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start & End Date Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Start Time
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                End Time
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add location, video call links, or meeting notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Created By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Created By
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              placeholder="Your Name / Anonymous"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs font-medium text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isEditing ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
