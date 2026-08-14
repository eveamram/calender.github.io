import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { BookItem, BookStatus } from '../../types';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  BookOpen,
  Plus,
  CheckCircle,
  Star,
  Edit2,
  Trash2,
  Bookmark,
  Award,
  X,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'book-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'reading',
    total_pages: 320,
    eve_current_page: 185,
    abbie_current_page: 190,
    cover_color: '#3B82F6',
    genre: 'Self-Improvement',
    thoughts_notes: 'Reading together for daily habits & streak building!',
    created_at: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    author: 'Gabrielle Zevin',
    status: 'completed',
    total_pages: 416,
    eve_current_page: 416,
    abbie_current_page: 416,
    eve_rating: 5,
    abbie_rating: 5,
    cover_color: '#EC4899',
    genre: 'Fiction',
    completed_date: '2026-07-28',
    thoughts_notes: 'One of our absolute favorite reads together! 💕',
    created_at: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'Designing Your Life',
    author: 'Bill Burnett & Dave Evans',
    status: 'want_to_read',
    total_pages: 272,
    cover_color: '#F59E0B',
    genre: 'Personal Growth',
    created_at: new Date().toISOString(),
  },
];

const PRESET_COVER_COLORS = [
  { name: 'Sapphire Blue', hex: '#3B82F6' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Emerald Green', hex: '#10B981' },
  { name: 'Violet Purple', hex: '#8B5CF6' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Teal Cyan', hex: '#06B6D4' },
];

export const BooksView: React.FC = () => {
  const isMobile = useIsMobile();
  const { activePersonaFilter } = useCalendar();
  const [filterShelf, setFilterShelf] = useState<'all' | BookStatus>('all');

  const [books, setBooks] = useState<BookItem[]>(() => {
    try {
      const saved = localStorage.getItem('calender_shared_books_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved books', e);
    }
    return INITIAL_BOOKS;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<BookStatus>('reading');
  const [totalPages, setTotalPages] = useState<number | ''>('');
  const [evePage, setEvePage] = useState<number | ''>('');
  const [abbiePage, setAbbiePage] = useState<number | ''>('');
  const [eveRating, setEveRating] = useState<number>(0);
  const [abbieRating, setAbbieRating] = useState<number>(0);
  const [coverColor, setCoverColor] = useState('#3B82F6');
  const [genre, setGenre] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    localStorage.setItem('calender_shared_books_v1', JSON.stringify(books));
    window.dispatchEvent(new Event('storage'));
  }, [books]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('calender_shared_books_v1');
        if (saved) setBooks(JSON.parse(saved));
      } catch (e) {
        console.error('Storage sync error for books:', e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setStatus('reading');
    setTotalPages('');
    setEvePage('');
    setAbbiePage('');
    setEveRating(0);
    setAbbieRating(0);
    setCoverColor('#3B82F6');
    setGenre('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: BookItem) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setStatus(book.status);
    setTotalPages(book.total_pages || '');
    setEvePage(book.eve_current_page || '');
    setAbbiePage(book.abbie_current_page || '');
    setEveRating(book.eve_rating || 0);
    setAbbieRating(book.abbie_rating || 0);
    setCoverColor(book.cover_color || '#3B82F6');
    setGenre(book.genre || '');
    setNotes(book.thoughts_notes || '');
    setIsModalOpen(true);
  };

  const handleSaveBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const bookData: BookItem = {
      id: editingBook ? editingBook.id : `book-${Date.now()}`,
      title: title.trim(),
      author: author.trim() || 'Unknown Author',
      status,
      total_pages: totalPages !== '' ? Number(totalPages) : undefined,
      eve_current_page: evePage !== '' ? Number(evePage) : undefined,
      abbie_current_page: abbiePage !== '' ? Number(abbiePage) : undefined,
      eve_rating: eveRating > 0 ? eveRating : undefined,
      abbie_rating: abbieRating > 0 ? abbieRating : undefined,
      cover_color: coverColor,
      genre: genre.trim() || undefined,
      thoughts_notes: notes.trim() || undefined,
      completed_date: status === 'completed' ? (editingBook?.completed_date || format(new Date(), 'yyyy-MM-dd')) : undefined,
      created_at: editingBook ? editingBook.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (editingBook) {
      setBooks((prev) => prev.map((b) => (b.id === editingBook.id ? bookData : b)));
    } else {
      setBooks((prev) => [bookData, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteBook = (id: string) => {
    if (window.confirm('Are you sure you want to remove this book from your library?')) {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const handleUpdatePageProgress = (bookId: string, persona: 'Eve' | 'Abbie') => {
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) return;

    const currentPg = persona === 'Eve' ? (targetBook.eve_current_page || 0) : (targetBook.abbie_current_page || 0);
    const newPgStr = window.prompt(`Update current page for ${persona} (Total: ${targetBook.total_pages || '?'}):`, currentPg.toString());

    if (newPgStr !== null) {
      const parsed = parseInt(newPgStr, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        setBooks((prev) =>
          prev.map((b) => {
            if (b.id === bookId) {
              const updated = {
                ...b,
                [persona === 'Eve' ? 'eve_current_page' : 'abbie_current_page']: parsed,
                updated_at: new Date().toISOString(),
              };
              // Check if both reached total pages
              if (b.total_pages && parsed >= b.total_pages && (persona === 'Eve' ? b.abbie_current_page : b.eve_current_page) === b.total_pages) {
                updated.status = 'completed';
                updated.completed_date = format(new Date(), 'yyyy-MM-dd');
              }
              return updated;
            }
            return b;
          })
        );
      }
    }
  };

  const handleMarkAsCompleted = (bookId: string) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id === bookId) {
          const tot = b.total_pages || 100;
          return {
            ...b,
            status: 'completed',
            eve_current_page: tot,
            abbie_current_page: tot,
            completed_date: format(new Date(), 'yyyy-MM-dd'),
            updated_at: new Date().toISOString(),
          };
        }
        return b;
      })
    );
  };

  const currentlyReadingBooks = books.filter((b) => b.status === 'reading');
  const activeReadingBook = currentlyReadingBooks[0];

  const filteredBooks = books.filter((b) => {
    if (filterShelf === 'all') return true;
    return b.status === filterShelf;
  });

  const completedCount = books.filter((b) => b.status === 'completed').length;
  const wantToReadCount = books.filter((b) => b.status === 'want_to_read').length;

  return (
    <div style={{
      maxWidth: '100%',
      margin: '0 auto',
      paddingBottom: '5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Top Header & Controls */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        marginBottom: '1.25rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            margin: 0,
          }}>
            Shared Book Library <BookOpen size={20} color="#6366F1" />
          </h2>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>
            {activePersonaFilter === 'all' ? 'Eve & Abbie’s shared reading list & accomplishments' : 'Shared book tracker & reading goals'}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAddModal}
          style={{
            padding: '0.45rem 0.85rem',
            fontSize: '0.8rem',
            alignSelf: isMobile ? 'flex-start' : 'center',
            borderRadius: '999px',
          }}
        >
          <Plus size={15} /> Add Book
        </button>
      </div>

      {/* Hero Section: Currently Reading Together */}
      {activeReadingBook && (
        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          padding: isMobile ? '1.1rem' : '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-subtle)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.65rem',
            borderRadius: '999px',
            backgroundColor: `${activeReadingBook.cover_color || '#3B82F6'}15`,
            color: activeReadingBook.cover_color || '#3B82F6',
            fontWeight: 800,
            fontSize: '0.75rem',
            marginBottom: '0.85rem',
          }}>
            <BookOpen size={13} /> Reading Together Now
          </div>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1.25rem',
            alignItems: isMobile ? 'stretch' : 'center',
          }}>
            {/* Book Cover Placeholder */}
            <div style={{
              width: isMobile ? '100%' : '110px',
              height: isMobile ? '140px' : '150px',
              borderRadius: '14px',
              backgroundColor: activeReadingBook.cover_color || '#3B82F6',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '1rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {activeReadingBook.genre || 'Book'}
              </span>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, lineHeight: 1.25 }}>
                  {activeReadingBook.title}
                </h4>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 0 0', opacity: 0.9, fontWeight: 600 }}>
                  {activeReadingBook.author}
                </p>
              </div>
            </div>

            {/* Reading Progress Bars & Actions */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeReadingBook.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  by {activeReadingBook.author} • {activeReadingBook.total_pages ? `${activeReadingBook.total_pages} total pages` : 'In Progress'}
                </p>
              </div>

              {/* Progress Bars for Eve & Abbie */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {/* Eve Progress */}
                {activeReadingBook.total_pages && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span style={{ color: '#EC4899', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EC4899' }}></span>
                        Eve’s Progress
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Page {activeReadingBook.eve_current_page || 0} of {activeReadingBook.total_pages} ({Math.min(100, Math.round(((activeReadingBook.eve_current_page || 0) / activeReadingBook.total_pages) * 100))}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--bg-hover)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, ((activeReadingBook.eve_current_page || 0) / activeReadingBook.total_pages) * 100)}%`,
                        backgroundColor: '#EC4899',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}></div>
                    </div>
                  </div>
                )}

                {/* Abbie Progress */}
                {activeReadingBook.total_pages && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '3px' }}>
                      <span style={{ color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></span>
                        Abbie’s Progress
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Page {activeReadingBook.abbie_current_page || 0} of {activeReadingBook.total_pages} ({Math.min(100, Math.round(((activeReadingBook.abbie_current_page || 0) / activeReadingBook.total_pages) * 100))}%)
                      </span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '999px', backgroundColor: 'var(--bg-hover)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, ((activeReadingBook.abbie_current_page || 0) / activeReadingBook.total_pages) * 100)}%`,
                        backgroundColor: '#3B82F6',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease',
                      }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button
                  type="button"
                  onClick={() => handleUpdatePageProgress(activeReadingBook.id, 'Eve')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    border: '1px solid #FBCFE8',
                    backgroundColor: '#FDF2F8',
                    color: '#BE185D',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Update Eve’s Page
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdatePageProgress(activeReadingBook.id, 'Abbie')}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    border: '1px solid #BFDBFE',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Update Abbie’s Page
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkAsCompleted(activeReadingBook.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    border: 'none',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle size={13} /> Finish Book
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shelf Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '0.25rem' : '0.4rem',
        marginBottom: '1.25rem',
        backgroundColor: 'var(--bg-hover)',
        padding: '4px',
        borderRadius: '999px',
        border: '1px solid var(--border-color)',
        overflowX: 'auto',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {[
          { id: 'all' as const, label: `All Books (${books.length})` },
          { id: 'reading' as const, label: `📖 Reading (${currentlyReadingBooks.length})` },
          { id: 'want_to_read' as const, label: `📌 Wishlist (${wantToReadCount})` },
          { id: 'completed' as const, label: `🏆 Accomplished (${completedCount})` },
        ].map((tab) => {
          const isSelected = filterShelf === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterShelf(tab.id)}
              style={{
                flex: isMobile ? '1 0 auto' : 1,
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                border: 'none',
                backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 800,
                fontSize: '0.775rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Book Cards Grid */}
      {filteredBooks.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px border-dashed var(--border-color)',
        }}>
          <BookOpen size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            No books in this shelf yet
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Tap "Add Book" to track a new book together!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {filteredBooks.map((book) => {
            const isCompleted = book.status === 'completed';
            const isReading = book.status === 'reading';

            return (
              <div
                key={book.id}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.85rem',
                  boxShadow: 'var(--shadow-subtle)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      backgroundColor: isCompleted ? '#D1FAE5' : isReading ? '#DBEAFE' : '#FEF3C7',
                      color: isCompleted ? '#047857' : isReading ? '#1D4ED8' : '#B45309',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      {isCompleted && <Award size={12} />}
                      {isReading && <BookOpen size={12} />}
                      {!isCompleted && !isReading && <Bookmark size={12} />}
                      {isCompleted ? 'Accomplished' : isReading ? 'Reading Now' : 'Want to Read'}
                    </span>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(book)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBook(book.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {book.title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0.5rem 0' }}>
                    by {book.author}
                  </p>

                  {/* Notes / Thoughts */}
                  {book.thoughts_notes && (
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      backgroundColor: 'var(--bg-hover)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '8px',
                      margin: '0.4rem 0',
                    }}>
                      "{book.thoughts_notes}"
                    </p>
                  )}
                </div>

                {/* Star Ratings for Completed Books */}
                {isCompleted && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: '#EC4899' }}>Eve’s Rating:</span>
                      <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {'★'.repeat(book.eve_rating || 5)}{'☆'.repeat(5 - (book.eve_rating || 5))}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                      <span style={{ color: '#3B82F6' }}>Abbie’s Rating:</span>
                      <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {'★'.repeat(book.abbie_rating || 5)}{'☆'.repeat(5 - (book.abbie_rating || 5))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(9, 9, 11, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '1rem',
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '420px',
            padding: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Book Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Atomic Habits"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Author
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. James Clear"
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookStatus)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700 }}
                  >
                    <option value="reading">📖 Reading</option>
                    <option value="want_to_read">📌 Wishlist</option>
                    <option value="completed">🏆 Accomplished</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Total Pages
                  </label>
                  <input
                    type="number"
                    value={totalPages}
                    onChange={(e) => setTotalPages(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="e.g. 320"
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Page Progress inputs if Reading */}
              {status === 'reading' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-hover)', padding: '0.75rem', borderRadius: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#EC4899', display: 'block', marginBottom: '4px' }}>
                      Eve’s Current Page
                    </label>
                    <input
                      type="number"
                      value={evePage}
                      onChange={(e) => setEvePage(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="e.g. 150"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#3B82F6', display: 'block', marginBottom: '4px' }}>
                      Abbie’s Current Page
                    </label>
                    <input
                      type="number"
                      value={abbiePage}
                      onChange={(e) => setAbbiePage(e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="e.g. 150"
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>
              )}

              {/* Ratings if Accomplished */}
              {status === 'completed' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-hover)', padding: '0.75rem', borderRadius: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#EC4899', display: 'block', marginBottom: '4px' }}>
                      Eve’s Rating (1-5)
                    </label>
                    <select
                      value={eveRating}
                      onChange={(e) => setEveRating(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value={0}>Select rating...</option>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>{'★'.repeat(r)} ({r}/5)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.725rem', fontWeight: 700, color: '#3B82F6', display: 'block', marginBottom: '4px' }}>
                      Abbie’s Rating (1-5)
                    </label>
                    <select
                      value={abbieRating}
                      onChange={(e) => setAbbieRating(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                    >
                      <option value={0}>Select rating...</option>
                      {[1, 2, 3, 4, 5].map((r) => (
                        <option key={r} value={r}>{'★'.repeat(r)} ({r}/5)</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Cover Color Theme
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {PRESET_COVER_COLORS.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => setCoverColor(col.hex)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: col.hex,
                        border: coverColor === col.hex ? '3px solid var(--text-primary)' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Shared Notes & Takeaways
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Favorite quotes, thoughts, or shared memories..."
                  rows={2}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  style={{ borderRadius: '999px', padding: '0.45rem 1rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: '999px', padding: '0.45rem 1.25rem', fontWeight: 800 }}
                >
                  {editingBook ? 'Save Changes' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
