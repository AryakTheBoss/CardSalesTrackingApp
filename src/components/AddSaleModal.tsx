import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
  onClose: () => void;
}

export const AddSaleModal = ({ onClose }: Props) => {
  const inventory = useStore(state => state.inventory) || [];
  const addSale = useStore(state => state.addSale);
  
  const [cardId, setCardId] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [notes, setNotes] = useState('');

  const availableCards = inventory.filter(c => c.status === 'in-stock');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !soldPrice) return;

    addSale({
      cardId,
      soldPrice: parseFloat(soldPrice),
      notes
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Log a Sale</h2>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Card</label>
            <select 
              className="glass-input" 
              value={cardId}
              onChange={e => setCardId(e.target.value)}
              required
              style={{ appearance: 'auto', background: '#1e1b4b' }}
            >
              <option value="" disabled>Select a card from inventory...</option>
              {availableCards.map(card => (
                <option key={card.id} value={card.id}>
                  {card.name} (Paid: ${card.pricePaid})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sold Price ($)</label>
            <input 
              type="number" 
              step="0.01"
              className="glass-input" 
              placeholder="0.00"
              value={soldPrice}
              onChange={e => setSoldPrice(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Sale Notes</label>
            <textarea 
              className="glass-input" 
              placeholder="Platform (e.g. eBay), fees, shipping, etc."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="glass-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="glass-button primary">Log Sale</button>
          </div>
        </form>
      </div>
    </div>
  );
};
