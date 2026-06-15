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
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');
  const [notes, setNotes] = useState('');

  const availableCards = inventory.filter(c => c.status === 'in-stock');
  const filteredCards = availableCards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCard = (card: any) => {
    setCardId(card.id);
    setSearchQuery(card.name);
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCardId('');
    setIsOpen(true);
  };

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
          <div className="form-group" style={{ position: 'relative' }}>
            <label>Search & Select Card</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Start typing to search..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              required
            />
            {isOpen && (
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  maxHeight: '200px', 
                  overflowY: 'auto', 
                  zIndex: 50,
                  marginTop: '0.25rem',
                  background: '#1e1b4b',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {filteredCards.length > 0 ? (
                  filteredCards.map(card => (
                    <div 
                      key={card.id} 
                      onClick={() => handleSelectCard(card)}
                      style={{ 
                        padding: '0.75rem 1rem', 
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div className="font-medium">{card.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Paid: ${card.pricePaid.toFixed(2)} 
                        {card.type === 'slab' && (card.gradingCompany || card.grade) ? ` • ${card.gradingCompany} ${card.grade}` : ''}
                        {card.type === 'raw' && card.condition ? ` • ${card.condition}` : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    No matching cards found.
                  </div>
                )}
              </div>
            )}
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
