"use client";

import { useState } from 'react';
import { Bookmark, Search, Trash2, ArrowRight } from 'lucide-react';

export interface SavedSearch {
  id: string;
  query: string;
  category: string;
  gidcZone?: string;
  frequency: 'Daily' | 'Weekly' | 'Instantly';
  dateAdded: string;
}

interface SavedSearchesPanelProps {
  onRerunSearch: (query: string, category?: string) => void;
}

const defaultSaved: SavedSearch[] = [
  {
    id: 's-1',
    query: 'Paracetamol API',
    category: 'Pharma & Healthcare',
    gidcZone: 'Nandesari GIDC',
    frequency: 'Instantly',
    dateAdded: '3 days ago',
  },
  {
    id: 's-2',
    query: 'Woven Cotton Fabrics',
    category: 'Textiles & Apparel',
    gidcZone: 'Pandesara GIDC',
    frequency: 'Weekly',
    dateAdded: '1 week ago',
  },
  {
    id: 's-3',
    query: 'Carbide boring tools',
    category: 'Machinery & Industrial',
    gidcZone: 'Vatva GIDC',
    frequency: 'Daily',
    dateAdded: '2 weeks ago',
  },
];

import { useEffect } from 'react';

export default function SavedSearchesPanel({ onRerunSearch }: SavedSearchesPanelProps) {
  const [searches, setSearches] = useState<SavedSearch[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('artha_saved_searches');
      if (stored) return JSON.parse(stored);
    }
    return defaultSaved;
  });
  const [newQuery, setNewQuery] = useState('');
  const [newCategory, setNewCategory] = useState('Pharma & Healthcare');
  const [newZone, setNewZone] = useState('');
  const [freq, setFreq] = useState<'Daily' | 'Weekly' | 'Instantly'>('Daily');
  const [notification, setNotification] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('artha_saved_searches', JSON.stringify(searches));
  }, [searches]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searches.length > 0) {
        const randomSearch = searches[Math.floor(Math.random() * searches.length)];
        const mockSuppliers = [
          'Surat Texturizers Ltd',
          'Baroda Organic Chemicals',
          'Morbi Vitrified Plant 8',
          'Vatva Precision Valve GIDC'
        ];
        const supplier = mockSuppliers[Math.floor(Math.random() * mockSuppliers.length)];
        
        setNotification(
          `New verified supplier "${supplier}" listed under GIDC matching your tracked search "${randomSearch.query}".`
        );
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [searches]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuery.trim()) return;

    const newItem: SavedSearch = {
      id: `s-${Date.now()}`,
      query: newQuery,
      category: newCategory,
      gidcZone: newZone || undefined,
      frequency: freq,
      dateAdded: 'Just now',
    };

    setSearches([newItem, ...searches]);
    setNewQuery('');
    setNewZone('');
  };


  const handleDelete = (id: string) => {
    setSearches(searches.filter(s => s.id !== id));
  };

  return (
    <div className="bg-white border border-border-default rounded-xl p-5 space-y-4 shadow-2xs font-sans text-xs animate-fade-in">
      {notification && (
        <div className="bg-trust-blue-bg text-trust-blue border border-trust-blue/20 rounded-xl p-3.5 flex items-start justify-between text-xs animate-slide-up shadow-sm">
          <div className="flex gap-2">
            <span className="font-bold">🔔 live alert:</span>
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-text-muted hover:text-navy cursor-pointer font-bold pl-2 select-none">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between pb-2 border-b border-border-default/50">
        <h3 className="font-bold text-[10px] uppercase tracking-wider text-text-primary flex items-center gap-1.5">
          <Bookmark size={12} className="text-gold" />
          <span>Tracked Sourcing Searches</span>
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-navy hover:bg-navy-light text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
        >
          {showForm ? 'Cancel' : '+ New Search Alert'}
        </button>
      </div>

      {/* Add New Search Tracker Form */}
      {showForm && (
        <form onSubmit={(e) => { handleAdd(e); setShowForm(false); }} className="bg-cream-secondary p-3.5 rounded-xl border border-border-default/50 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-border-strong">
            <Search size={14} className="text-text-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Product keyword e.g. Ibuprofen API..."
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              className="bg-transparent border-0 focus:outline-none text-xs flex-1 w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select 
              value={newCategory} 
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-white border border-border-strong rounded-lg p-1.5 text-xs"
            >
              <option>Pharma & Healthcare</option>
              <option>Textiles & Apparel</option>
              <option>Machinery & Industrial</option>
              <option>Home & Consumer</option>
              <option>Chemicals & Materials</option>
            </select>

            <input
              type="text"
              placeholder="GIDC zone (Optional)"
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              className="bg-white border border-border-strong rounded-lg p-1.5 text-xs"
            />

            <select 
              value={freq} 
              onChange={(e) => setFreq(e.target.value as any)}
              className="bg-white border border-border-strong rounded-lg p-1.5 text-xs"
            >
              <option value="Instantly">Alert Instantly</option>
              <option value="Daily">Alert Daily</option>
              <option value="Weekly">Alert Weekly</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold-hover text-white font-bold py-2 rounded-lg transition-all cursor-pointer text-center text-xs shadow-2xs"
          >
            Save Search Alert Tracker
          </button>
        </form>
      )}

      {/* List */}
      <div className="divide-y divide-border-default/50 space-y-3">
        {searches.length === 0 ? (
          <div className="text-center py-6 text-text-muted font-semibold">
            No saved searches yet. Add one above to get matching alerts.
          </div>
        ) : (
          searches.map((s) => {
            const freqColors: Record<string, string> = {
              Instantly: 'bg-trust-red-bg text-trust-red border-trust-red/20',
              Daily: 'bg-trust-amber-bg text-trust-amber border-trust-amber/20',
              Weekly: 'bg-trust-blue-bg text-trust-blue border-trust-blue/20'
            };
            return (
              <div key={s.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-text-primary flex items-center gap-2">
                    <span>{s.query}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border ${freqColors[s.frequency] || 'bg-navy/10 text-navy'}`}>
                      {s.frequency}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-secondary">
                    {s.category} {s.gidcZone ? `· Zone: ${s.gidcZone}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-text-muted font-medium">{s.dateAdded}</span>
                  <button
                    onClick={() => onRerunSearch(s.query, s.category)}
                    className="bg-cream hover:bg-cream-secondary border border-border-strong text-navy px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    Rerun
                    <ArrowRight size={10} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-text-muted hover:text-trust-red p-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
