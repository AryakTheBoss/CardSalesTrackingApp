import React, { useState, useEffect } from 'react';
import { useStore, type Shift } from '../store/useStore';
import { X, Trash2, AlertCircle } from 'lucide-react';

export const EditShiftModal = ({ shift, onClose }: { shift: Shift; onClose: () => void }) => {
  const updateShift = useStore(state => state.updateShift);
  const deleteShift = useStore(state => state.deleteShift);
  const shows = useStore(state => state.shows) || [];
  
  const [employee, setEmployee] = useState(shift.employee);
  const [showId, setShowId] = useState(shift.showId);
  const [hours, setHours] = useState(shift.hours.toString());
  const [hourlyRate, setHourlyRate] = useState(shift.hourlyRate.toString());
  const [bonus, setBonus] = useState(shift.bonus.toString());
  const [status, setStatus] = useState<'Paid' | 'Pending'>(shift.status);
  
  const initialDate = new Date(shift.date);
  const localInitialDateStr = `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(localInitialDateStr);
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

      await updateShift(shift.id, {
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
        setError(err.message || 'Failed to update shift. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this shift?')) {
      try {
        setError(null);
        setIsSubmitting(true);
        await deleteShift(shift.id);
        onClose();
      } catch (err: any) {
        console.error(err);
        if (err.code === 'permission-denied') {
          setError("You don't have permission to delete this shift.");
        } else {
          setError(err.message || 'Failed to delete shift. Please try again.');
        }
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Edit Shift</h2>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="glass-button" 
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
              Delete Shift
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="glass-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="glass-button primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
