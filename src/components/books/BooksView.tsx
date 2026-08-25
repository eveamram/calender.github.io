import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { BookItem, BookStatus } from '../../types';
import { PersonaAvatar } from '../ui/PersonaAvatar';
import {
  Plus,
  Star,
  Trash2,
  Search,
  X,
  Edit3,
  Check,
  Sparkles,
  BookOpen,
  Coffee,
  Heart,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BooksViewProps {
  onOpenAddBookModal: (bookToEdit?: BookItem | null) => void;
}

// 8 Playful & Fun Local CSS Cover Themes (No External Images or APIs)
const COVER_THEMES = [
  {
    key: 'red_rising',
    matchTitle: 'red rising',
    bg: 'from-[#6b0f1a] via-[#b91c1c] to-[#f59e0b]',
    titleColor: 'text-amber-100',
    spine: 'bg-amber-300/30',
    art: (
      <div className="absolute inset-0 flex flex-col justify-end p-2 pointer-events-none overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-amber-300/40 blur-xs mx-auto -mb-4 shadow-lg" />
        <div className="w-full h-10 bg-gradient-to-t from-purple-950/90 via-rose-950/80 to-transparent rounded-t-full" />
        <div className="absolute top-3 right-3 text-amber-200/80 text-[10px] animate-pulse">✦ ✨</div>
      </div>
    ),
  },
  {
    key: 'midnight',
    matchTitle: 'midnight library',
    bg: 'from-[#0f172a] via-[#1e1b4b] to-[#312e81]',
    titleColor: 'text-indigo-100',
    spine: 'bg-indigo-300/30',
    art: (
      <div className="absolute inset-0 p-2 pointer-events-none">
        <div className="absolute top-3 right-3 text-amber-200 text-sm">🌙</div>
        <div className="absolute top-8 left-4 text-indigo-200/60 text-[9px]">✨</div>
        <div className="absolute bottom-6 right-5 text-indigo-200/70 text-[10px]">✦</div>
        <div className="absolute bottom-2 left-2 right-2 h-8 border-t border-indigo-400/20 rounded-t-2xl bg-indigo-950/40" />
      </div>
    ),
  },
  {
    key: 'chemistry',
    matchTitle: 'chemistry',
    bg: 'from-[#ea580c] via-[#f97316] to-[#fb923c]',
    titleColor: 'text-amber-50',
    spine: 'bg-amber-200/30',
    art: (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-14 h-14 text-white stroke-[1.5]">
          <path d="M10 2v7.5L4.5 18A2 2 0 006 21h12a2 2 0 001.5-3L14 9.5V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </svg>
      </div>
    ),
  },
  {
    key: 'seven_husbands',
    matchTitle: 'evelyn hugo',
    bg: 'from-[#064e3b] via-[#047857] to-[#0d9488]',
    titleColor: 'text-emerald-100',
    spine: 'bg-emerald-300/30',
    art: (
      <div className="absolute inset-2 border-2 border-amber-300/40 rounded-xl pointer-events-none flex flex-col justify-between p-1.5">
        <div className="text-[10px] text-amber-300/70 text-center">👑</div>
        <div className="text-[10px] text-amber-300/70 text-center">✦</div>
      </div>
    ),
  },
  {
    key: 'celestial',
    matchTitle: '',
    bg: 'from-[#4c1d95] via-[#7e22ce] to-[#db2777]',
    titleColor: 'text-pink-100',
    spine: 'bg-pink-300/30',
    art: (
      <div className="absolute inset-0 p-2 pointer-events-none opacity-80">
        <div className="absolute top-2 left-3 text-pink-200 text-xs">✨</div>
        <div className="absolute bottom-4 right-3 text-amber-200 text-xs">💫</div>
      </div>
    ),
  },
  {
    key: 'botanical',
    matchTitle: '',
    bg: 'from-[#14532d] via-[#15803d] to-[#4d7c0f]',
    titleColor: 'text-lime-100',
    spine: 'bg-lime-200/30',
    art: (
      <div className="absolute inset-0 p-2 pointer-events-none opacity-60 flex items-end justify-center">
        <span className="text-2xl mb-1">🌿</span>
      </div>
    ),
  },
  {
    key: 'golden',
    matchTitle: '',
    bg: 'from-[#78350f] via-[#b45309] to-[#d97706]',
    titleColor: 'text-amber-100',
    spine: 'bg-amber-200/30',
    art: (
      <div className="absolute inset-0 p-2 pointer-events-none opacity-70 flex items-center justify-center">
        <span className="text-3xl">☀️</span>
      </div>
    ),
  },
  {
    key: 'ocean',
    matchTitle: '',
    bg: 'from-[#134e4a] via-[#0e7490] to-[#0284c7]',
    titleColor: 'text-cyan-100',
    spine: 'bg-cyan-200/30',
    art: (
      <div className="absolute inset-0 p-2 pointer-events-none opacity-60 flex items-end justify-center">
        <span className="text-xl mb-2">🌊</span>
      </div>
    ),
  },
];

const getCoverTheme = (book: BookItem) => {
  const t = book.title.toLowerCase();
  const matched = COVER_THEMES.find((ct) => ct.matchTitle && t.includes(ct.matchTitle));
  if (matched) return matched;

  let hash = 0;
  const str = book.id + book.title;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return COVER_THEMES[Math.abs(hash) % COVER_THEMES.length];
};

export const BooksView: React.FC<BooksViewProps> = ({ onOpenAddBookModal }) => {
  const { bookItems, updateBookItem, deleteBookItem, filterByProfile, profileColors } = useStore();
  const [activeStatusTab, setActiveStatusTab] = useState<BookStatus | 'all'>('reading');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const [editingPersonPage, setEditingPersonPage] = useState<{ bookId: string; person: 'Eve' | 'Abbie' } | null>(null);
  const [customPageInput, setCustomPageInput] = useState<string>('');
  const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

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

  const featuredBook = useMemo(() => {
    if (selectedBookId) {
      const found = filteredBooks.find((b) => b.id === selectedBookId);
      if (found) return found;
    }
    return filteredBooks[0] || null;
  }, [selectedBookId, filteredBooks]);

  const totalPagesRead = useMemo(() => {
    return filteredByPersona.reduce((acc, b) => {
      if (b.status === 'completed' && b.total_pages) return acc + b.total_pages;
      if (b.status === 'reading' && b.current_page) return acc + b.current_page;
      return acc;
    }, 0);
  }, [filteredByPersona]);

  const readingCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'reading').length;
  }, [filteredByPersona]);

  const completedCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'completed').length;
  }, [filteredByPersona]);

  const wantToReadCount = useMemo(() => {
    return filteredByPersona.filter((b) => b.status === 'want_to_read').length;
  }, [filteredByPersona]);

  const tabs: {
    status: BookStatus | 'all';
    label: string;
    count: number;
    emoji: string;
    activeStyle: string;
  }[] = [
    {
      status: 'reading',
      label: 'Reading',
      count: readingCount,
      emoji: '📖',
      activeStyle: 'bg-purple-100/90 text-purple-950 border-purple-300 shadow-2xs',
    },
    {
      status: 'want_to_read',
      label: 'Want to Read',
      count: wantToReadCount,
      emoji: '📝',
      activeStyle: 'bg-rose-100/90 text-rose-950 border-rose-300 shadow-2xs',
    },
    {
      status: 'completed',
      label: 'Finished',
      count: completedCount,
      emoji: '🎉',
      activeStyle: 'bg-emerald-100/90 text-emerald-950 border-emerald-300 shadow-2xs',
    },
    {
      status: 'all',
      label: 'All',
      count: filteredByPersona.length,
      emoji: '📚',
      activeStyle: 'bg-amber-100/90 text-amber-950 border-amber-300 shadow-2xs',
    },
  ];

  const handleUpdateRating = async (book: BookItem, newRating: number) => {
    confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 } });
    await updateBookItem(book.id, { rating: newRating });
  };

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

  const handleStatusChange = async (book: BookItem, newStatus: BookStatus) => {
    const updates: Partial<BookItem> = { status: newStatus };
    if (newStatus === 'completed') {
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
      if (book.total_pages) updates.current_page = book.total_pages;
    }
    await updateBookItem(book.id, updates);
  };

  const handleDeleteBook = async (bookId: string) => {
    await deleteBookItem(bookId);
  };

  return (
    <div className="bg-[#F7F2EA] min-h-screen py-4 sm:py-6 px-3 sm:px-6 md:px-8 font-sans pb-40 transition-colors">
      <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
        {/* Rich Warm & Dreamy Header Banner (Lavender -> Pink -> Peach -> Warm Yellow) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-200/90 via-pink-200/85 via-amber-100/90 to-yellow-100/90 p-4 sm:p-6 md:p-8 border border-amber-200/80 shadow-xs">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-300/40 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 right-12 w-56 h-56 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 relative z-10">
            <div className="space-y-2 w-full md:w-auto">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900 bg-white/60 backdrop-blur-md px-3 py-1 rounded-full border border-purple-300/50 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                <span>Personal Reading Sanctuary</span>
                <Coffee className="w-3.5 h-3.5 text-amber-700 ml-0.5" />
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span>Reading Shelf</span>
                <span className="text-rose-500 font-sans font-normal">♡</span>
              </h1>



              {/* Mobile-Friendly Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="flex items-center gap-2 bg-[#FFFDF9]/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-200/60 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    📖
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-extrabold text-stone-900 block leading-tight truncate">{totalPagesRead}</span>
                    <span className="text-[9px] text-stone-500 font-semibold block truncate">Pages</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF9]/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-200/60 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    📚
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-extrabold text-stone-900 block leading-tight truncate">{readingCount}</span>
                    <span className="text-[9px] text-stone-500 font-semibold block truncate">Reading</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-[#FFFDF9]/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-amber-200/60 shadow-2xs">
                  <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    ⭐
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-extrabold text-stone-900 block leading-tight truncate">{completedCount}</span>
                    <span className="text-[9px] text-stone-500 font-semibold block truncate">Finished</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenAddBookModal(null)}
              className="p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-purple-950 hover:bg-purple-900 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              title="Add Book"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Add Book</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#FFFDF9] border border-stone-300/70 text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-purple-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeStatusTab === tab.status;
              return (
                <button
                  key={tab.status}
                  onClick={() => setActiveStatusTab(tab.status)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold border transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? tab.activeStyle
                      : 'bg-[#FFFDF9] text-stone-600 border-stone-200/80 hover:bg-stone-100/60'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-black/10 text-slate-900' : 'bg-stone-200/60 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Layout */}
        {filteredBooks.length === 0 ? (
          <div className="bg-[#FFFDF9] rounded-3xl p-8 sm:p-12 border border-stone-200/80 text-center space-y-3 shadow-2xs">
            <BookOpen className="w-10 h-10 mx-auto text-stone-300 stroke-[1.5]" />
            <p className="text-sm font-bold text-stone-800">No books found on your shelf</p>
            <p className="text-xs text-stone-500">Add a new book or adjust your search filter.</p>
            <button
              onClick={() => onOpenAddBookModal(null)}
              className="text-xs font-bold text-purple-900 hover:underline pt-2 cursor-pointer inline-block"
            >
              + Add a book to your shelf
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Featured Book Panel */}
            {featuredBook && (
              <div className="lg:col-span-5 bg-[#FBF7F2] rounded-3xl p-4 sm:p-5 border border-stone-300/60 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* Book Cover */}
                  {(() => {
                    const theme = getCoverTheme(featuredBook);
                    return (
                      <div
                        className={`w-28 sm:w-32 h-40 sm:h-44 rounded-2xl bg-gradient-to-br ${theme.bg} p-3 flex flex-col justify-between text-white shadow-md relative overflow-hidden shrink-0 border border-white/20 mx-auto sm:mx-0`}
                      >
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.spine}`} />
                        <div className="absolute top-0 right-3 w-4 h-6 bg-white/25 backdrop-blur-md rounded-b-sm flex items-center justify-center">
                          <span className="text-[9px] text-white">🔖</span>
                        </div>

                        {theme.art}
                        <div className="text-[9px] uppercase tracking-widest text-white/70 pl-2">✦</div>

                        <div className="space-y-0.5 z-10 pl-2">
                          <h3 className={`text-xs font-serif font-bold leading-tight line-clamp-3 ${theme.titleColor}`}>
                            {featuredBook.title}
                          </h3>
                          <p className="text-[9px] text-white/80 truncate font-sans">{featuredBook.author}</p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Info & Controls */}
                  <div className="space-y-2.5 flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 truncate leading-snug">
                          {featuredBook.title}
                        </h2>
                        <p className="text-xs text-stone-500 font-semibold truncate">by {featuredBook.author}</p>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onOpenAddBookModal(featuredBook)}
                          className="text-stone-400 hover:text-purple-900 p-1.5 rounded-xl hover:bg-stone-200/50 transition-colors cursor-pointer"
                          title="Edit Book"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(featuredBook.id)}
                          className="text-stone-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-xl transition-all cursor-pointer"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Profile Badge */}
                    <div className="flex items-center gap-1.5">
                      <PersonaAvatar person={featuredBook.profile || 'Eve'} size="sm" />
                      <span
                        className="text-[10px] font-extrabold text-white px-2.5 py-1 rounded-full inline-block shadow-2xs"
                        style={{
                          backgroundColor:
                            profileColors[featuredBook.profile || 'Eve'] || '#2563eb',
                        }}
                      >
                        {featuredBook.profile === 'Both' ? 'Both (Eve & Abbie)' : featuredBook.profile || 'Eve'}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((starNum) => (
                        <button
                          key={starNum}
                          onClick={() => handleUpdateRating(featuredBook, starNum)}
                          className="hover:scale-110 transition-transform cursor-pointer p-0.5"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              starNum <= (featuredBook.rating || 0)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300 fill-stone-100'
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Status Toggle */}
                    <div>
                      <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
                        STATUS
                      </span>
                      <div className="flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl">
                        {(['reading', 'want_to_read', 'completed'] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => handleStatusChange(featuredBook, st)}
                            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center ${
                              featuredBook.status === st
                                ? 'bg-[#FFFDF9] text-stone-900 shadow-2xs font-extrabold'
                                : 'text-stone-500 hover:text-stone-800'
                            }`}
                          >
                            {st === 'reading' ? 'Reading' : st === 'want_to_read' ? 'Want to Read' : 'Finished'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROGRESS Section */}
                <div className="border-t border-stone-200/60 pt-3 space-y-3">
                  <h4 className="text-xs font-extrabold text-stone-400 uppercase tracking-wider flex items-center gap-1">
                    <span>
                      {featuredBook.profile === 'Both'
                        ? 'OUR READING PROGRESS'
                        : `${(featuredBook.profile || 'Eve').toUpperCase()}'S PROGRESS`}
                    </span>
                    <Heart className="w-3 h-3 text-rose-400 fill-rose-300" />
                  </h4>

                  {(
                    featuredBook.profile === 'Eve'
                      ? (['Eve'] as const)
                      : featuredBook.profile === 'Abbie'
                      ? (['Abbie'] as const)
                      : (['Eve', 'Abbie'] as const)
                  ).map((person) => {
                    const personColor = profileColors[person] || (person === 'Eve' ? '#2563eb' : '#ec4899');
                    const personPage = person === 'Eve' ? (featuredBook.eve_page ?? featuredBook.current_page ?? 0) : (featuredBook.abbie_page ?? featuredBook.current_page ?? 0);
                    const totalP = featuredBook.total_pages || 300;
                    const pPercent = Math.min(100, Math.round((personPage / totalP) * 100));
                    const isEditing = editingPersonPage?.bookId === featuredBook.id && editingPersonPage?.person === person;

                    return (
                      <div key={person} className="space-y-2 bg-[#FFFDF9] p-3 rounded-2xl border border-stone-200/80 shadow-2xs">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                          <div className="flex items-center gap-2">
                            <PersonaAvatar person={person} size="md" />
                            <span className="font-serif font-extrabold">{person}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-stone-600">
                              {personPage} / {totalP} pgs ({pPercent}%)
                            </span>
                            <button
                              onClick={() => {
                                setEditingPersonPage({ bookId: featuredBook.id, person });
                                setCustomPageInput(String(personPage));
                              }}
                              className="text-stone-400 hover:text-purple-900 p-0.5 cursor-pointer"
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
                              className="w-full px-3 py-1 rounded-xl bg-stone-100 border border-purple-400 text-xs font-bold focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveCustomPersonPage(featuredBook, person)}
                              className="p-1.5 rounded-xl text-white cursor-pointer"
                              style={{ backgroundColor: personColor }}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="w-full h-2.5 bg-stone-200/80 rounded-full overflow-hidden p-0.5">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ width: `${pPercent}%`, backgroundColor: personColor }}
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                              <button
                                onClick={() => handleIncrementPersonPage(featuredBook, person, 5)}
                                className="py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition-colors cursor-pointer text-center"
                              >
                                +5 pgs
                              </button>
                              <button
                                onClick={() => handleIncrementPersonPage(featuredBook, person, 15)}
                                className="py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition-colors cursor-pointer text-center"
                              >
                                +15 pgs
                              </button>
                              <button
                                onClick={() => handleIncrementPersonPage(featuredBook, person, 30)}
                                className="py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] transition-colors cursor-pointer text-center"
                              >
                                +30 pgs
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shelf Grid Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900 flex items-center gap-1.5">
                  <span className="text-rose-500">♡</span>
                  <span>Your Books Shelf</span>
                </h3>
              </div>

              {/* Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredBooks.map((book) => {
                  const theme = getCoverTheme(book);
                  const isSelected = featuredBook?.id === book.id;
                  const effectivePage = Math.max(book.current_page || 0, book.eve_page || 0, book.abbie_page || 0);
                  const hasPages = Boolean(book.total_pages && book.total_pages > 0);
                  const progressPercent = hasPages
                    ? Math.min(100, Math.round((effectivePage / (book.total_pages || 1)) * 100))
                    : 0;

                  return (
                    <div
                      key={book.id}
                      onClick={() => setSelectedBookId(book.id)}
                      className={`bg-[#FFFDF9] rounded-3xl p-2.5 sm:p-3 border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-300/50 shadow-md scale-[1.02]'
                          : 'border-stone-200/80 hover:border-stone-300 hover:shadow-xs'
                      }`}
                    >
                      <div
                        className={`w-full aspect-[2/3] rounded-2xl bg-gradient-to-br ${theme.bg} p-2.5 flex flex-col justify-between text-white shadow-sm relative overflow-hidden border border-white/20`}
                      >
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${theme.spine}`} />
                        <div className="absolute top-0 right-2 w-3.5 h-5 bg-white/25 backdrop-blur-md rounded-b-sm flex items-center justify-center">
                          <span className="text-[8px] text-white">🔖</span>
                        </div>

                        {theme.art}
                        <div className="text-[8px] uppercase tracking-widest text-white/70 pl-1.5">✦</div>

                        <div className="space-y-0.5 z-10 pl-1.5">
                          <h4 className={`text-xs font-serif font-bold leading-tight line-clamp-2 ${theme.titleColor}`}>
                            {book.title}
                          </h4>
                          <p className="text-[9px] text-white/80 truncate font-sans">{book.author}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate leading-tight group-hover:text-purple-900">
                            {book.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                            }}
                            className="text-stone-300 hover:text-rose-600 transition-colors p-0.5 shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-500 truncate">by {book.author}</p>

                        <div>
                          <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-900 inline-block">
                            {book.status === 'reading' ? 'Reading' : book.status === 'want_to_read' ? 'Want to Read' : 'Finished'}
                          </span>
                        </div>

                        {book.status === 'reading' && (
                          <div className="space-y-0.5 pt-0.5">
                            <div className="flex items-center justify-between text-[9px] font-bold text-stone-500">
                              <span>{effectivePage}/{book.total_pages || 300}</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-200/80 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-800 rounded-full"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add New Book Card */}
                <button
                  onClick={() => onOpenAddBookModal(null)}
                  className="w-full aspect-[2/3] rounded-3xl border-2 border-dashed border-purple-300/70 hover:border-purple-500 bg-purple-50/40 hover:bg-purple-50/80 flex flex-col items-center justify-center gap-1.5 p-3 transition-all cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-2xl bg-purple-200/60 text-purple-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-extrabold text-purple-900">Add Book</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksView;
