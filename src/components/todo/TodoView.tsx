import React, { useState, useMemo } from 'react';
import { useStore, getTodayDateString } from '../../context/StoreContext';
import { TaskItem } from '../../types';
import {
  CheckCircle,
  Circle,
  Plus,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface TodoViewProps {
  onOpenAddModal: () => void;
}

export const TodoView: React.FC<TodoViewProps> = ({ onOpenAddModal }) => {
  const { tasks, addTask, toggleTaskComplete, deleteTask, filterByProfile, activeProfile, profileColors } = useStore();
  const [quickTitle, setQuickTitle] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  const filteredTasks = useMemo(() => {
    return filterByProfile(tasks);
  }, [tasks, filterByProfile]);

  const todayStr = getTodayDateString();

  const { todayTasks, upcomingTasks, noDateTasks, completedTasks } = useMemo(() => {
    const today: TaskItem[] = [];
    const upcoming: TaskItem[] = [];
    const noDate: TaskItem[] = [];
    const completed: TaskItem[] = [];

    filteredTasks.forEach((t) => {
      if (t.is_completed) {
        completed.push(t);
      } else if (!t.due_date) {
        noDate.push(t);
      } else if (t.due_date <= todayStr) {
        today.push(t);
      } else {
        upcoming.push(t);
      }
    });

    return { todayTasks: today, upcomingTasks: upcoming, noDateTasks: noDate, completedTasks: completed };
  }, [filteredTasks, todayStr]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    await addTask({
      title: quickTitle.trim(),
      is_completed: false,
      due_date: todayStr,
      profile: activeProfile === 'Both' ? 'Eve' : activeProfile,
    });

    setQuickTitle('');
  };

  const renderTaskRow = (task: TaskItem) => {
    const ownerName = task.profile || 'Eve';
    const badgeColor = profileColors[ownerName] || '#2563eb';

    return (
      <div
        key={task.id}
        className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => toggleTaskComplete(task.id)}
            className="text-slate-300 hover:text-blue-600 transition-colors shrink-0"
          >
            {task.is_completed ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 stroke-[1.75]" />
            )}
          </button>

          <span
            className={`text-sm font-medium text-slate-900 truncate ${
              task.is_completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {task.priority === 'high' && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
              <AlertCircle className="w-3 h-3" />
              High
            </span>
          )}

          {task.due_date && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              <CalendarIcon className="w-3 h-3" />
              {task.due_date === todayStr ? 'Today' : task.due_date}
            </span>
          )}

          {activeProfile === 'Both' && (
            <span
              className="text-[10px] font-bold text-white px-2 py-0.5 rounded-md"
              style={{ backgroundColor: badgeColor }}
            >
              {ownerName}
            </span>
          )}

          <button
            onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-8 py-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">To-Do List</h1>
          <p className="text-xs text-slate-500 font-medium">Simple, clean task management</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Details</span>
        </button>
      </div>

      <form onSubmit={handleQuickAdd} className="relative">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="What needs to be done? (e.g. Buy toothpaste)"
          className="w-full bg-white border border-slate-200/90 rounded-2xl py-3.5 pl-4 pr-24 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 rounded-xl text-xs transition-colors"
        >
          Add Task
        </button>
      </form>

      <div className="space-y-6 pt-2">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              Today
            </h2>
            <span className="text-xs font-semibold text-slate-400">{todayTasks.length}</span>
          </div>

          {todayTasks.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400 font-medium">
              No tasks for today. Enjoy your day!
            </div>
          ) : (
            <div className="space-y-2">{todayTasks.map(renderTaskRow)}</div>
          )}
        </div>

        {upcomingTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Upcoming
              </h2>
              <span className="text-xs font-semibold text-slate-400">{upcomingTasks.length}</span>
            </div>
            <div className="space-y-2">{upcomingTasks.map(renderTaskRow)}</div>
          </div>
        )}

        {noDateTasks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Someday / No Date
              </h2>
              <span className="text-xs font-semibold text-slate-400">{noDateTasks.length}</span>
            </div>
            <div className="space-y-2">{noDateTasks.map(renderTaskRow)}</div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-slate-200/60 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCompleted((prev) => !prev)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                {showCompleted ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Completed ({completedTasks.length})</span>
              </button>

              {showCompleted && (
                <button
                  onClick={async () => {
                    if (window.confirm('Clear all completed tasks?')) {
                      for (const t of completedTasks) {
                        await deleteTask(t.id);
                      }
                    }
                  }}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Clear Completed
                </button>
              )}
            </div>

            {showCompleted && <div className="space-y-2">{completedTasks.map(renderTaskRow)}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
