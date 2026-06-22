import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStore, type CardType } from '../store/useStore';

interface Props {
  onClose: () => void;
}

export const AddCardModal = ({ onClose }: Props) => {
  const addCard = useStore(state => state.addCard);
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('English');
  const [pricePaid, setPricePaid] = useState('');
  const [isTrade, setIsTrade] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [type, setType] = useState<CardType>('raw');
  const [gradingCompany, setGradingCompany] = useState('');
  const [grade, setGrade] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePaid) return;

    try {
      setError(null);
      setIsSubmitting(true);
      await addCard({
        name,
        pricePaid: parseFloat(pricePaid),
        quantity: parseInt(quantity) || 1,
        type,
        notes,
        isTrade,
        language,
        ...(type === 'slab' ? { gradingCompany, grade } : {}),
        ...(type === 'raw' ? { condition } : {})
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.message || 'Failed to save card. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Add New Card</h2>
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
            <label>Card Name</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. Charizard Base Set Shadowless"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <select 
              className="glass-input"
              value={language}
              onChange={e => setLanguage(e.target.value)}
              style={{ background: '#1e1b4b', appearance: 'auto' }}
            >
              <option value="English">English</option>
              <option value="Japanese">Japanese</option>
              <option value="Chinese">Chinese</option>
              <option value="Korean">Korean</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="checkbox" 
              id="isTrade" 
              checked={isTrade} 
              onChange={e => setIsTrade(e.target.checked)} 
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isTrade" style={{ margin: 0, cursor: 'pointer' }}>Acquired via Trade?</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price Paid (Per Unit) ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="glass-input" 
                placeholder="0.00"
                value={pricePaid}
                onChange={e => setPricePaid(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Quantity</label>
              <input 
                type="number" 
                min="1"
                step="1"
                className="glass-input" 
                placeholder="1"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Card Type</label>
            <div className="glass-panel p-2" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className={`glass-button ${type === 'raw' ? 'bg-white/20' : 'border-transparent'}`} 
                style={{ border: type === 'raw' ? '' : 'none', flex: 1, background: type === 'raw' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                onClick={() => setType('raw')}
              >
                Raw Card
              </button>
              <button 
                type="button"
                className={`glass-button ${type === 'slab' ? 'bg-white/20' : 'border-transparent'}`} 
                style={{ border: type === 'slab' ? '' : 'none', flex: 1, background: type === 'slab' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                onClick={() => setType('slab')}
              >
                Slab (Graded)
              </button>
              <button 
                type="button"
                className={`glass-button ${type === 'sealed' ? 'bg-white/20' : 'border-transparent'}`} 
                style={{ border: type === 'sealed' ? '' : 'none', flex: 1, background: type === 'sealed' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                onClick={() => setType('sealed')}
              >
                Sealed
              </button>
            </div>
          </div>

          {type === 'slab' && (
            <div className="flex-row gap-4 mb-4" style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Grading Company</label>
                <select 
                  className="glass-input" 
                  value={gradingCompany}
                  onChange={e => setGradingCompany(e.target.value)}
                  style={{ appearance: 'auto', background: '#1e1b4b' }}
                >
                  <option value="" disabled>Select...</option>
                  <option value="PSA">PSA</option>
                  <option value="CGC">CGC</option>
                  <option value="BGS">BGS</option>
                  <option value="TAG">TAG</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Grade</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. 10"
                  value={grade}
                  onChange={e => setGrade(e.target.value)}
                />
              </div>
            </div>
          )}

          {type === 'raw' && (
            <div className="form-group mb-4">
              <label>Condition</label>
              <select 
                className="glass-input" 
                value={condition}
                onChange={e => setCondition(e.target.value)}
                style={{ appearance: 'auto', background: '#1e1b4b' }}
              >
                <option value="" disabled>Select...</option>
                <option value="NM">NM (Near Mint)</option>
                <option value="LP">LP (Lightly Played)</option>
                <option value="MP">MP (Moderately Played)</option>
                <option value="HP">HP (Heavily Played)</option>
                <option value="DMG">DMG (Damaged)</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              className="glass-input" 
              placeholder="Condition, grading company, etc."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="glass-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="glass-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
