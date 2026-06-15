import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore, type Card, type CardType } from '../store/useStore';

interface Props {
  card: Card;
  onClose: () => void;
}

export const EditCardModal = ({ card, onClose }: Props) => {
  const updateCard = useStore(state => state.updateCard);
  const deleteCard = useStore(state => state.deleteCard);
  
  const [name, setName] = useState(card.name);
  const [pricePaid, setPricePaid] = useState(card.pricePaid.toString());
  const [type, setType] = useState<CardType>(card.type);
  const [gradingCompany, setGradingCompany] = useState(card.gradingCompany || '');
  const [grade, setGrade] = useState(card.grade || '');
  const [condition, setCondition] = useState(card.condition || '');
  const [notes, setNotes] = useState(card.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pricePaid) return;

    updateCard(card.id, {
      name,
      pricePaid: parseFloat(pricePaid),
      type,
      notes,
      ...(type === 'slab' ? { gradingCompany, grade, condition: undefined } : {}),
      ...(type === 'raw' ? { condition, gradingCompany: undefined, grade: undefined } : {})
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card? Associated sales will also be deleted.')) {
      deleteCard(card.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Edit Card</h2>
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
            <div className="glass-panel p-2" style={{ display: 'flex', padding: '0.5rem', gap: '0.5rem' }}>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="glass-button" 
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={handleDelete}
            >
              <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
              Delete
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" className="glass-button" onClick={onClose}>Cancel</button>
              <button type="submit" className="glass-button primary">Save Changes</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
