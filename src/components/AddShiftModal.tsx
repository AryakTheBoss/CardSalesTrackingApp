import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X, AlertCircle } from 'lucide-react';

export const AddShiftModal = ({ onClose }: { onClose: () => void }) => {
  const addShift = useStore(state => state.addShift);
  const shows = useStore(state => state.shows) || [];
  
  const [employee, setEmployee] = useState('');
  const [showId, setShowId] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [bonus, setBonus] = useState('0');
  const [status, setStatus] = useState<'Paid' | 'Pending'>('Pending');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate date when show changes
  useEffect(() => {
    if (showId) {
      const selectedShow = shows.find(s => s.id === showId);
      if (selectedShow) {
        const d = new Date(selectedShow.date);
        const localString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        setDate(localString);
      }
    } else {
      setDate('');
    }
  }, [showId, shows]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !showId || !date || !hours || !hourlyRate) return;

    try {
      setError(null);
      setIsSubmitting(true);
      const [year, month, day] = date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      await addShift({
        employee,
        showId,
        date: localDate.toISOString(),
        hours: parseFloat(hours),
        hourlyRate: parseFloat(hourlyRate),
        bonus: parseFloat(bonus) || 0,
        status
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.message || 'Failed to add shift. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Log a Shift</h2>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Employee Name</label>
            <select 
              className="glass-input" 
              value={employee}
              onChange={e => setEmployee(e.target.value)}
              style={{ background: '#1e1b4b', appearance: 'auto' }}
              required
            >
              <option value="">-- Select Employee --</option>
              <option value="Tae">Tae</option>
              <option value="Hub">Hub</option>
              <option value="Vic">Vic</option>
            </select>
          </div>

          <div className="form-group">
            <label>Registered Show</label>
            <select 
              className="glass-input"
              value={showId}
              onChange={e => setShowId(e.target.value)}
              style={{ background: '#1e1b4b', appearance: 'auto' }}
              required
            >
              <option value="">-- Select Show --</option>
              {shows.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(show => (
                <option key={show.id} value={show.id}>
                  {show.name} ({new Date(show.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date (Auto-populated)</label>
            <input 
              type="date" 
              className="glass-input" 
              value={date}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hours Worked</label>
              <input 
                type="number" 
                step="0.5"
                min="0"
                className="glass-input" 
                placeholder="0"
                value={hours}
                onChange={e => setHours(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Hourly Rate ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="glass-input" 
                placeholder="0.00"
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Bonus Amount ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                className="glass-input" 
                placeholder="0.00"
                value={bonus}
                onChange={e => setBonus(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Status</label>
              <select 
                className="glass-input" 
                value={status}
                onChange={e => setStatus(e.target.value as 'Paid' | 'Pending')}
                style={{ background: '#1e1b4b', appearance: 'auto' }}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="glass-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="glass-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
