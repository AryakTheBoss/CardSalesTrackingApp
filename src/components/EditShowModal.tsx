import React, { useState } from 'react';
import { useStore, type Show } from '../store/useStore';
import { X, AlertCircle } from 'lucide-react';

export const EditShowModal = ({ show, onClose }: { show: Show; onClose: () => void }) => {
  const updateShow = useStore(state => state.updateShow);
  
  const d = new Date(show.date);
  const localString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const [name, setName] = useState(show.name);
  const [date, setDate] = useState(localString);
  const [tables, setTables] = useState(show.tables.toString());
  const [tableCost, setTableCost] = useState(show.tableCost.toString());
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tables || !tableCost) return;

    try {
      setError(null);
      setIsSubmitting(true);
      const [year, month, day] = date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      await updateShow(show.id, {
        name,
        date: localDate.toISOString(),
        tables: parseInt(tables),
        tableCost: parseFloat(tableCost)
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.message || 'Failed to update show. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
      <div className="glass-panel" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '2rem', margin: '1rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gradient">Edit Show</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
              <AlertCircle size={20} />
              <p className="text-sm" style={{ margin: 0 }}>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Show Name</label>
            <input
              type="text"
              className="glass-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Dallas Card Show"
              required
            />
          </div>

          <div className="form-group">
            <label>Show Date</label>
            <input
              type="date"
              className="glass-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Number of Tables</label>
              <input
                type="number"
                className="glass-input"
                min="1"
                step="1"
                value={tables}
                onChange={e => setTables(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Cost per Table ($)</label>
              <input
                type="number"
                className="glass-input"
                min="0"
                step="0.01"
                value={tableCost}
                onChange={e => setTableCost(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="glass-button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="glass-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
