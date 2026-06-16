import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export const AddShowModal = ({ onClose }: { onClose: () => void }) => {
  const addShow = useStore(state => state.addShow);
  
  const [name, setName] = useState('');
  
  const today = new Date();
  const localTodayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(localTodayString);
  const [tables, setTables] = useState('1');
  const [tableCost, setTableCost] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tables || !tableCost) return;

    const [year, month, day] = date.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    addShow({
      name,
      date: localDate.toISOString(),
      tables: parseInt(tables),
      tableCost: parseFloat(tableCost)
    });
    onClose();
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

        <h2 className="text-2xl font-bold mb-6 text-gradient">Register for Show</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
            <button type="button" className="glass-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="glass-button primary">
              Add Show
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
