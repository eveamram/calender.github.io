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



export const BooksView: React.FC<BooksViewProps> = ({ onOpenAddBookModal }) => {
  const { bookItems, updateBookItem, deleteBookItem, filterByProfile, activeProfile, profileColors } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus | 'all'>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPersonPage, setEditingPersonPage] = useState<{ bookId: string; person: 'Eve' | 'Abbie' } | null>(null);
  const [editingPageBookId, setEditingPageBookId] = useState<string | null>(null);
  const [customPageInput, setCustomPageInput] = useState<string>('');

  const handleIncrementPersonPage = async (book: BookItem, person: 'Eve' | 'Abbie', pgs = 15) => {
    const currentP = person === 'Eve' ? (book.eve_page ?? book.current_page ?? 0) : (book.abbie_page ?? book.current_page ?? 0);
    const nextPg = Math.min(book.total_pages || 9999, currentP + pgs);
    const updates: Partial<BookItem> = person === 'Eve' ? { eve_page: nextPg } : { abbie_page: nextPg };
    await updateBookItem(book.id, updates);
  };

  const handleSaveCustomPersonPage = async (book: BookItem, person: 'Eve' | 'Abbie') => {
    const parsed = parseInt(customPageInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      const nextPg = book.total_pages ? Math.min(book.total_pages, parsed) : parsed;
      const updates: Partial<BookItem> = person === 'Eve' ? { eve_page: nextPg } : { abbie_page: nextPg };
      await updateBookItem(book.id, updates);
    }
    setEditingPersonPage(null);
    setCustomPageInput('');
  };

  const filteredByPersona = useMemo(() => {
    return filterByProfile(bookItems);
  }, [bookItems, filterByProfile]);

  const filteredBooks = useMemo(() => {
    return filteredByPersona.filter((b) => {
      const matchesStatus = activeStatusTab === 'all' || b.status === activeStatusTab;
      const matchesSearch =
        !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [filteredByPersona, activeStatusTab, searchQuery]);

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
      {/* Colorful Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" /> Book Sanctuary 📚
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-orange-300 fill-orange-300" /> {totalPagesRead} Pages Read
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white border border-white/30 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-xs">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> {completedCount} Finished
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight drop-shadow-xs">Your Reading Shelf</h1>
          <p className="text-xs text-purple-100 font-semibold opacity-95">“A reader lives a thousand lives before he dies.” — George R.R. Martin</p>
        </div>

        <button
          onClick={onOpenAddBookModal}
          className="z-10 flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50 active:scale-95 font-extrabold px-5 py-2.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Colorful Filter & Search Bar */}
      <div className="bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-blue-50/80 rounded-2xl p-4 border border-purple-100 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-purple-200/80 text-xs font-medium focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all shadow-xs"
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
        </div>

        {/* Shelf Tabs */}
        <div className="flex items-center gap-2 border-t border-purple-100/60 pt-3 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeStatusTab === tab.status;
            return (
              <button
                key={tab.status}
                onClick={() => setActiveStatusTab(tab.status)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-white/90 text-purple-900 hover:bg-white border border-purple-100 shadow-2xs'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-800'
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
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 border border-purple-100 text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 mx-auto text-purple-300 stroke-[1.5]" />
          <p className="text-base font-bold text-purple-900">No books found</p>
          <p className="text-xs text-purple-500 font-medium">Add a new book or change your search/filter parameters.</p>
          <button
            onClick={onOpenAddBookModal}
            className="text-xs font-black text-purple-700 hover:underline pt-2 cursor-pointer"
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
            const ownerName = book.profile || 'Eve';
            const badgeColor = profileColors[ownerName] || '#2563eb';
            const isEditingThisPage = editingPageBookId === book.id;

            const BOOK_PALETTES = [
              { cover: 'from-rose-500 via-pink-500 to-rose-600 border-rose-300/50', card: 'bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white border-rose-200/80' },
              { cover: 'from-blue-500 via-indigo-500 to-violet-600 border-blue-300/50', card: 'bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white border-blue-200/80' },
              { cover: 'from-emerald-500 via-teal-500 to-cyan-600 border-emerald-300/50', card: 'bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border-emerald-200/80' },
              { cover: 'from-purple-500 via-fuchsia-500 to-pink-600 border-purple-300/50', card: 'bg-gradient-to-br from-purple-50/70 via-fuchsia-50/40 to-white border-purple-200/80' },
              { cover: 'from-violet-600 via-indigo-600 to-purple-700 border-indigo-300/50', card: 'bg-gradient-to-br from-indigo-50/70 via-violet-50/40 to-white border-indigo-200/80' },
              { cover: 'from-cyan-500 via-sky-500 to-blue-600 border-cyan-300/50', card: 'bg-gradient-to-br from-cyan-50/70 via-sky-50/40 to-white border-cyan-200/80' },
            ];
            const palette = BOOK_PALETTES[idx % BOOK_PALETTES.length];

            return (
              <div
                key={book.id}
                className={`${palette.card} rounded-3xl p-5 border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative`}
              >
                {/* Book Header Card */}
                <div className="flex items-start gap-4">
                  <div className={`w-20 h-28 rounded-2xl bg-gradient-to-br ${palette.cover} flex flex-col items-center justify-between p-2.5 text-white shadow-md shrink-0 border-r-4 transform group-hover:scale-105 transition-transform duration-300 relative overflow-hidden`}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-white/20" />
                    <Bookmark className="w-5 h-5 text-yellow-200 fill-yellow-200/30" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-white/90">BOOK</span>
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="text-lg font-black text-slate-900 truncate leading-snug tracking-tight group-hover:text-indigo-600 transition-colors">
                        {book.title}
                      </h3>
                      <button
                        onClick={() => deleteBookItem(book.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs font-bold text-slate-500 truncate mt-0.5">by {book.author}</p>

                    {/* Interactive Rating Stars */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4, 5].map((starNum) => {
                        const isFilled = starNum <= (book.rating || 0);
                        return (
                          <button
                            key={starNum}
                            onClick={() => handleUpdateRating(book, starNum)}
                            className="p-0.5 text-yellow-400 hover:scale-125 transition-transform cursor-pointer"
                            title={`Rate ${starNum} Stars`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 fill-slate-100'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span
                        className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-md shadow-2xs"
                        style={{ backgroundColor: badgeColor }}
                      >
                        {ownerName === 'Both' ? 'Both (Eve & Abbie)' : ownerName}
                      </span>
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
                          ? 'bg-purple-600 text-white shadow-xs'
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
                    {book.profile === 'Both' ? (
                      <div className="space-y-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/70">
                        <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          Shared Book Progression 📚
                        </h5>
                        
                        {(['Eve', 'Abbie'] as const).map((person) => {
                          const personColor = profileColors[person] || (person === 'Eve' ? '#2563eb' : '#ec4899');
                          const personPage = person === 'Eve' ? (book.eve_page ?? book.current_page ?? 0) : (book.abbie_page ?? book.current_page ?? 0);
                          const totalP = book.total_pages || 1;
                          const pPercent = Math.min(100, Math.round((personPage / totalP) * 100));
                          const isEditing = editingPersonPage?.bookId === book.id && editingPersonPage?.person === person;

                          return (
                            <div key={person} className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: personColor }} />
                                  <span>{person}'s Progress</span>
                                </span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] font-extrabold text-slate-600">
                                    {personPage} / {book.total_pages || '?'} pgs ({pPercent}%)
                                  </span>
                                  <button
                                    onClick={() => {
                                      setEditingPersonPage({ bookId: book.id, person });
                                      setCustomPageInput(String(personPage));
                                    }}
                                    className="text-slate-400 hover:text-blue-600 p-0.5 cursor-pointer"
                                    title={`Set ${person}'s current page`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {isEditing ? (
                                <div className="flex items-center gap-1.5 pt-1">
                                  <input
                                    type="number"
                                    value={customPageInput}
                                    onChange={(e) => setCustomPageInput(e.target.value)}
                                    placeholder="Page #"
                                    className="w-full px-2.5 py-1 rounded-xl bg-slate-100 border border-blue-400 text-xs font-bold focus:outline-none"
                                  />
                                  <button
                                    onClick={() => handleSaveCustomPersonPage(book, person)}
                                    className="p-1.5 rounded-xl text-white hover:opacity-90 cursor-pointer"
                                    style={{ backgroundColor: personColor }}
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setEditingPersonPage(null)}
                                    className="p-1.5 rounded-xl bg-slate-200 text-slate-600 hover:bg-slate-300 cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                                    <div
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{ width: `${pPercent}%`, backgroundColor: personColor }}
                                    />
                                  </div>
                                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                                    <button
                                      onClick={() => {
                                        handleIncrementPersonPage(book, person, 5);
                                        confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
                                      }}
                                      className="py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[10px] transition-all cursor-pointer"
                                    >
                                      +5 pgs 📖
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleIncrementPersonPage(book, person, 15);
                                        confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
                                      }}
                                      className="py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[10px] transition-all cursor-pointer"
                                    >
                                      +15 pgs ⚡
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleIncrementPersonPage(book, person, 30);
                                        confetti({ particleCount: 35, spread: 70, origin: { y: 0.8 } });
                                      }}
                                      className="py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[10px] transition-all cursor-pointer"
                                    >
                                      +30 pgs 🚀
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
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

                            <div className="grid grid-cols-3 gap-1.5 pt-1">
                              <button
                                onClick={() => {
                                  handleIncrementPage(book, 5);
                                  confetti({ particleCount: 15, spread: 40, origin: { y: 0.8 } });
                                }}
                                className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[11px] transition-all active:scale-95 cursor-pointer"
                              >
                                +5 pgs 📖
                              </button>
                              <button
                                onClick={() => {
                                  handleIncrementPage(book, 15);
                                  confetti({ particleCount: 25, spread: 60, origin: { y: 0.8 } });
                                }}
                                className="py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[11px] transition-all active:scale-95 cursor-pointer"
                              >
                                +15 pgs ⚡
                              </button>
                              <button
                                onClick={() => {
                                  handleIncrementPage(book, 30);
                                  confetti({ particleCount: 40, spread: 80, origin: { y: 0.8 } });
                                }}
                                className="py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] transition-all active:scale-95 cursor-pointer"
                              >
                                +30 pgs 🚀
                              </button>
                            </div>
                          </>
                        )}
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
