import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BookItem, BookStatus } from '../../types';
import { Plus, BookOpen, Star, Trash2, Sparkles, Flame, CheckCircle, Bookmark } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BooksViewProps {
  onOpenAddBookModal: () => void;
}

const BOOK_SPINE_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-rose-600',
  'from-emerald-500 to-teal-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

export const BooksView: React.FC<BooksViewProps> = ({ onOpenAddBookModal }) => {
  const { bookItems, updateBookItem, deleteBookItem, filterByProfile, activeProfile, profileColors } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus>('reading');

  const filteredBooks = useMemo(() => {
    return filterByProfile(bookItems);
  }, [bookItems, filterByProfile]);

  const booksByStatus = useMemo(() => {
    return filteredBooks.filter((b) => b.status === activeStatusTab);
  }, [filteredBooks, activeStatusTab]);

  const totalPagesRead = useMemo(() => {
    return filteredBooks.reduce((acc, b) => {
      if (b.status === 'completed' && b.total_pages) return acc + b.total_pages;
      if (b.status === 'reading' && b.current_page) return acc + b.current_page;
      return acc;
    }, 0);
  }, [filteredBooks]);

  const tabs: { status: BookStatus; label: string; count: number; icon: string }[] = [
    { status: 'reading', label: 'Currently Reading', count: filteredBooks.filter((b) => b.status === 'reading').length, icon: '📖' },
    { status: 'want_to_read', label: 'Want to Read', count: filteredBooks.filter((b) => b.status === 'want_to_read').length, icon: '🔖' },
    { status: 'completed', label: 'Finished Library', count: filteredBooks.filter((b) => b.status === 'completed').length, icon: '🎉' },
  ];

  const handleUpdateRating = async (book: BookItem, newRating: number) => {
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    await updateBookItem(book.id, { rating: newRating });
  };

  const handleIncrementPage = async (book: BookItem) => {
    const nextPg = Math.min((book.total_pages || 999), (book.current_page || 0) + 20);
    const updates: Partial<BookItem> = { current_page: nextPg };

    if (book.total_pages && nextPg >= book.total_pages) {
      updates.status = 'completed';
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.7 } });
    }

    await updateBookItem(book.id, updates);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Fun Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Book Nook & Oasis 📚
            </span>
            <span className="bg-amber-400/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-amber-300" /> {totalPagesRead} Pages Logged
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Reading Shelf</h1>
          <p className="text-xs text-purple-100 font-medium">“A reader lives a thousand lives before he dies.” — George R.R. Martin</p>
        </div>

        <button
          onClick={onOpenAddBookModal}
          className="z-10 flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Fun Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeStatusTab === tab.status;
          return (
            <button
              key={tab.status}
              onClick={() => setActiveStatusTab(tab.status)}
              className={`flex items-center gap-2.5 py-2.5 px-4 rounded-2xl text-xs font-black transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Books Display Grid */}
      {booksByStatus.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-base font-bold text-slate-700">No books in this shelf yet</p>
          <p className="text-xs text-slate-400">Click below to add a book you're reading or want to read!</p>
          <button
            onClick={onOpenAddBookModal}
            className="text-xs font-black text-blue-600 hover:underline pt-2"
          >
            + Add a book to your shelf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {booksByStatus.map((book, idx) => {
            const hasPages = Boolean(book.total_pages && book.total_pages > 0);
            const progressPercent = hasPages
              ? Math.min(100, Math.round(((book.current_page || 0) / (book.total_pages || 1)) * 100))
              : 0;
            const gradient = BOOK_SPINE_GRADIENTS[idx % BOOK_SPINE_GRADIENTS.length];
            const ownerName = book.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || '#2563eb';

            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative"
              >
                {/* Book Header Card */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-16 rounded-xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-between p-2 text-white shadow-md shrink-0`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span className="text-[9px] font-black tracking-widest uppercase">READ</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-base font-black text-slate-900 truncate leading-snug">{book.title}</h3>
                      <button
                        onClick={() => deleteBookItem(book.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 truncate">{book.author}</p>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {book.genre && (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {book.genre}
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
                    </div>
                  </div>
                </div>

                {/* Progress bar if reading */}
                {book.status === 'reading' && hasPages && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Reading Progress</span>
                      <span>
                        {book.current_page || 0} / {book.total_pages} pgs ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <button
                      onClick={() => handleIncrementPage(book)}
                      className="w-full py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <span>+ Read 20 Pages</span>
                    </button>
                  </div>
                )}

                {/* Rating if completed */}
                {book.status === 'completed' && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Your Rating
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleUpdateRating(book, star)}
                          className="hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= (book.rating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
