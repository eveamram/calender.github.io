import React, { useState, useEffect } from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { ShoppingBag, Plus, Check, Trash2, Tag } from 'lucide-react';

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  purchased: boolean;
  owner: 'Eve' | 'Abbie' | 'Both';
  createdAt: string;
}

const DEFAULT_GROCERY_ITEMS: GroceryItem[] = [
  { id: '1', name: 'Bananas', category: 'Produce', purchased: false, owner: 'Both', createdAt: new Date().toISOString() },
  { id: '2', name: 'Organic Milk', category: 'Dairy & Eggs', purchased: false, owner: 'Eve', createdAt: new Date().toISOString() },
  { id: '3', name: 'Greek Yogurt', category: 'Dairy & Eggs', purchased: true, owner: 'Abbie', createdAt: new Date().toISOString() },
  { id: '4', name: 'Almond Butter', category: 'Pantry', purchased: false, owner: 'Both', createdAt: new Date().toISOString() },
];

const CATEGORIES = ['Produce', 'Dairy & Eggs', 'Pantry', 'Snacks & Drinks', 'Household', 'Other'];

export const GroceryView: React.FC = () => {
  const { activePersonaFilter } = useCalendar();
  const [items, setItems] = useState<GroceryItem[]>(() => {
    const saved = localStorage.getItem('calender_grocery_items_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed parsing grocery items', e);
      }
    }
    return DEFAULT_GROCERY_ITEMS;
  });

  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Produce');

  useEffect(() => {
    localStorage.setItem('calender_grocery_items_v1', JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
  }, [items]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      category: selectedCategory,
      purchased: false,
      owner: activePersonaFilter === 'all' ? 'Both' : activePersonaFilter,
      createdAt: new Date().toISOString(),
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, purchased: !item.purchased } : item))
    );
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) => {
    if (activePersonaFilter === 'all') return true;
    return item.owner === activePersonaFilter || item.owner === 'Both';
  });

  const activeItems = filteredItems.filter((i) => !i.purchased);
  const completedItems = filteredItems.filter((i) => i.purchased);

  return (
    <div style={{
      maxWidth: '650px',
      margin: '0 auto',
      paddingBottom: '5rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{
          fontSize: '1.35rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
        }}>
          Grocery List <ShoppingBag size={20} color="#10B981" />
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {activePersonaFilter === 'all' ? 'Shared store list for Eve & Abbie' : `Store list for ${activePersonaFilter}`}
        </p>
      </div>

      {/* Fast Mobile Entry Bar */}
      <form
        onSubmit={handleAddItem}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.85rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Add item (e.g. Eggs, Coffee)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{
              flex: 1,
              padding: '0.7rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.7rem 1.1rem',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '44px',
            }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Category Pill Selector */}
        <div style={{
          display: 'flex',
          gap: '0.35rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                border: selectedCategory === cat ? '1px solid #10B981' : '1px solid var(--border-color)',
                backgroundColor: selectedCategory === cat ? '#10B9811A' : 'transparent',
                color: selectedCategory === cat ? '#10B981' : 'var(--text-muted)',
                fontSize: '0.725rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </form>

      {/* Active Items List */}
      {activeItems.length === 0 && completedItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2.5rem 1rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          border: '1px border-subtle',
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
        }}>
          Your grocery list is empty.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {activeItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                minHeight: '52px',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }} />

                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.675rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      <Tag size={10} style={{ display: 'inline', marginRight: '2px' }} />
                      {item.category}
                    </span>
                    {item.owner !== 'Both' && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: item.owner === 'Eve' ? '#EC4899' : '#3B82F6',
                        backgroundColor: 'var(--bg-hover)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                      }}>
                        {item.owner}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item.id);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {/* Completed Items Section */}
          {completedItems.length > 0 && (
            <div style={{ marginTop: '1.5rem' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                letterSpacing: '0.04em',
                marginBottom: '0.65rem',
              }}>
                Purchased ({completedItems.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {completedItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.7rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-hover)',
                      border: '1px solid var(--border-subtle)',
                      opacity: 0.65,
                      cursor: 'pointer',
                      minHeight: '48px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Check size={14} />
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        {item.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '6px',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
