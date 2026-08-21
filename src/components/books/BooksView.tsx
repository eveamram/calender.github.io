import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BookItem, BookStatus } from '../../types';
import {
  Plus,
  BookOpen,
  Star,
  Trash2,
  Sparkles,
  Flame,
  CheckCircle,
  Bookmark,
  Search,
  Filter,
  ArrowRightLeft,
  Edit3,
  Check,
  X,
  BookMarked,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BooksViewProps {
  onOpenAddBookModal: () => void;
}

const BOOK_SPINE_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-purple-600 to-pink-600',
  'from-amber-500 to-rose-600',
  'from-emerald-600 to-teal-700',
  'from-cyan-600 to-blue-600',
  'from-violet-600 to-purple-700',
];

export const BooksView: React.FC<BooksViewProps> = ({ onOpenAddBookModal }) => {
  const { bookItems, updateBookItem, deleteBookItem, filterByProfile, activeProfile, profileColors } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus | 'all'>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [editingPageBookId, setEditingPageBookId] = useState<string | null>(null);
  const [customPageInput, setCustomPageInput] = useState<string>('');

  const filteredByPersona = useMemo(() => {
    return filterByProfile(bookItems);
  }, [bookItems, filterByProfile]);

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    filteredByPersona.forEach((b) => {
      if (b.genre) genres.add(b.genre);
    });
    return Array.from(genres);
  }, [filteredByPersona]);

  const filteredBooks = useMemo(() => {
    return filteredByPersona.filter((b) => {
      const matchesStatus = activeStatusTab === 'all' || b.status === activeStatusTab;
      const matchesGenre = selectedGenre === 'all' || b.genre === selectedGenre;
      const matchesSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.genre && b.genre.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesStatus && matchesGenre && matchesSearch;
    });
  }, [filteredByPersona, activeStatusTab, selectedGenre, searchQuery]);

  const totalPagesRead = useMemo(() => {
    return filteredByPersona.reduce((acc, b) => {
      if (b.status === 'completed' && b.total_pages) return acc + b.total_pages;
      if (b.status === 'reading' && b.current_page) return acc + b.current_page;
      return acc;
    }, 0);
  }, [filteredByPersona]);

  const completedCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'completed').length;
  }, [filteredByPersona]);

  const readingCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'reading').length;
  }, [filteredByPersona]);

  const wantToReadCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'want_to_read').length;
  }, [filteredByPersona]);

  const tabs: { status: BookStatus | 'all'; label: string; count: number; icon: string }[] = [
    { status: 'reading', label: 'Currently Reading', count: readingCount, icon: '📖' },
    { status: 'want_to_read', label: 'Want to Read', count: wantToReadCount, icon: '🔖' },
    { status: 'completed', label: 'Finished Library', count: completedCount, icon: '🎉' },
    { status: 'all', label: 'All Books', count: filteredByPersona.length, icon: '📚' },
  ];

  const handleUpdateRating = async (book: BookItem, newRating: number) => {
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    await updateBookItem(book.id, { rating: newRating });
  };

  const handleIncrementPage = async (book: BookItem, pgs = 20) => {
    const nextPg = Math.min(book.total_pages || 9999, (book.current_page || 0) + pgs);
    const updates: Partial<BookItem> = { current_page: nextPg };

    if (book.total_pages && nextPg >= book.total_pages) {
      updates.status = 'completed';
      confetti({ particleCount: 50, spread: 80, origin: { y: 0.7 } });
    }

    await updateBookItem(book.id, updates);
  };

  const handleStatusChange = async (book: BookItem, newStatus: BookStatus) => {
    const updates: Partial<BookItem> = { status: newStatus };
    if (newStatus === 'completed') {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      if (book.total_pages) updates.current_page = book.total_pages;
    }
    await updateBookItem(book.id, updates);
  };

  const handleSaveCustomPage = async (book: BookItem) => {
    const parsed = parseInt(customPageInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const nextPg = book.total_pages ? Math.min(book.total_pages, parsed) : parsed;
      const updates: Partial<BookItem> = { current_page: nextPg };
      if (book.total_pages && nextPg >= book.total_pages) {
        updates.status = 'completed';
        confetti({ particleCount: 50, spread: 80, origin: { y: 0.7 } });
      }
      await updateBookItem(book.id, updates);
    }
    setEditingPageBookId(null);
    setCustomPageInput('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-8 py-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Book Oasis 📚
            </span>
            <span className="bg-amber-400/30 text-amber-200 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-amber-300" /> {totalPagesRead} Pages Logged
            </span>
            <span className="bg-emerald-400/30 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> {completedCount} Books Completed
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Your Reading Shelf</h1>
          <p className="text-xs text-purple-100 font-medium">“A reader lives a thousand lives before he dies.” — George R.R. Martin</p>
        </div>

        <button
          onClick={onOpenAddBookModal}
          className="z-10 flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 active:scale-95 font-black px-5 py-2.5 rounded-2xl text-xs shadow-lg transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Genre Filter Pills */}
          {allGenres.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" /> Genre:
              </span>
              <button
                onClick={() => setSelectedGenre('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedGenre === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {allGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    selectedGenre === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Shelf Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeStatusTab === tab.status;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveStatusTab(tab.status)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/60 hover:bg-slate-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Books Display Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 mx-auto text-slate-300 stroke-[1.5]" />
          <p className="text-base font-bold text-slate-700">No books found</p>
          <p className="text-xs text-slate-400">Add a new book or change your search/filter parameters.</p>
          <button
            onClick={onOpenAddBookModal}
            className="text-xs font-black text-blue-600 hover:underline pt-2 cursor-pointer"
          >
            + Add a book to your shelf
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book, idx) => {
            const hasPages = Boolean(book.total_pages && book.total_pages > 0);
            const progressPercent = hasPages
              ? Math.min(100, Math.round(((book.current_page || 0) / (book.total_pages || 1)) * 100))
              : 0;
            const gradient = BOOK_SPINE_GRADIENTS[idx % BOOK_SPINE_GRADIENTS.length];
            const ownerName = book.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || '#2563eb';
            const isEditingThisPage = editingPageBookId === book.id;

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

                {/* Status Quick Switcher */}
                <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-xl border border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">
                    Status:
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStatusChange(book, 'reading')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                        book.status === 'reading'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Reading
                    </button>
                    <button
                      onClick={() => handleStatusChange(book, 'want_to_read')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                        book.status === 'want_to_read'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Wishlist
                    </button>
                    <button
                      onClick={() => handleStatusChange(book, 'completed')}
                      className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                        book.status === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Finished
                    </button>
                  </div>
                </div>

                {/* Progress Bar & Page Controls */}
                {book.status === 'reading' && (
                  <div className="space-y-2 pt-1 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Reading Progress</span>
                      <div className="flex items-center gap-1">
                        <span>
                          {book.current_page || 0} / {book.total_pages || '?'} pgs ({progressPercent}%)
                        </span>
                        <button
                          onClick={() => {
                            setEditingPageBookId(book.id);
                            setCustomPageInput(String(book.current_page || 0));
                          }}
                          className="text-slate-400 hover:text-blue-600 p-0.5"
                          title="Set current page"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {isEditingThisPage ? (
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="number"
                          value={customPageInput}
                          onChange={(e) => setCustomPageInput(e.target.value)}
                          placeholder="Current Page"
                          className="w-full px-2.5 py-1 rounded-xl bg-slate-100 border border-blue-400 text-xs font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveCustomPage(book)}
                          className="p-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingPageBookId(null)}
                          className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => handleIncrementPage(book, 10)}
                            className="py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[11px] transition-colors"
                          >
                            +10 Pages
                          </button>
                          <button
                            onClick={() => handleIncrementPage(book, 25)}
                            className="py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-[11px] transition-colors"
                          >
                            +25 Pages
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Rating if completed */}
                {book.status === 'completed' && (
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
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
