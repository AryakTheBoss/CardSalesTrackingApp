import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore, type CardType } from '../store/useStore';

interface Props {
  onClose: () => void;
}

export const AddCardModal = ({ onClose }: Props) => {
  const addCard = useStore(state => state.addCard);
  const [name, setName] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [type, setType] = useState<CardType>('raw');
  const [gradingCompany, setGradingCompany] = useState('');
  const [grade, setGrade] = useState('');
  const [condition, setCondition] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePaid) return;

    addCard({
      name,
      pricePaid: parseFloat(pricePaid),
      type,
      notes,
      ...(type === 'slab' ? { gradingCompany, grade } : {}),
      ...(type === 'raw' ? { condition } : {})
    });
    onClose();
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
          <div className="form-group">
            <label>Card Name</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. Base Set Charizard"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Price Paid ($)</label>
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

          <div className="form-group">
            <label>Card Type</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="raw" 
                  checked={type === 'raw'} 
                  onChange={() => setType('raw')} 
                /> Raw
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="type" 
                  value="slab" 
                  checked={type === 'slab'} 
                  onChange={() => setType('slab')} 
                /> Slab (Graded)
              </label>
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
            <button type="button" className="glass-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="glass-button primary">Save Card</button>
          </div>
        </form>
      </div>
    </div>
  );
};
