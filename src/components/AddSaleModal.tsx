import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Props {
  onClose: () => void;
  initialCardId?: string;
}

export const AddSaleModal = ({ onClose, initialCardId }: Props) => {
  const inventory = useStore(state => state.inventory) || [];
  const shows = useStore(state => state.shows) || [];
  const addSale = useStore(state => state.addSale);
  
  const [cardId, setCardId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [soldPrice, setSoldPrice] = useState('');
  const [isTrade, setIsTrade] = useState(false);
  const [quantitySold, setQuantitySold] = useState('1');
  const [availableQty, setAvailableQty] = useState(1);
  const today = new Date();
  const localTodayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [date, setDate] = useState(localTodayString);
  const [notes, setNotes] = useState('');
  const [showId, setShowId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCards = inventory.filter(c => c.status === 'in-stock');
  const filteredCards = availableCards.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!date) return;
    const [year, month, day] = date.split('-');
    const saleDateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    const matchedShow = shows.find(s => {
      const showD = new Date(s.date);
      const showStr = `${showD.getFullYear()}-${String(showD.getMonth() + 1).padStart(2, '0')}-${String(showD.getDate()).padStart(2, '0')}`;
      return showStr === saleDateStr;
    });

    if (matchedShow) {
      setShowId(matchedShow.id);
    }
  }, [date, shows]);

  useEffect(() => {
    if (initialCardId && inventory.length > 0) {
      const card = inventory.find(c => c.id === initialCardId);
      if (card) {
        setCardId(card.id);
        setSearchQuery(card.name);
        setAvailableQty(card.quantity || 1);
        setQuantitySold('1');
      }
    }
  }, [initialCardId, inventory]);

  const handleSelectCard = (card: any) => {
    setCardId(card.id);
    setSearchQuery(card.name);
    setAvailableQty(card.quantity || 1);
    setQuantitySold('1');
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCardId('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardId || !soldPrice) return;

    try {
      setError(null);
      setIsSubmitting(true);
      const [year, month, day] = date.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

      await addSale({
        cardId,
        soldPrice: parseFloat(soldPrice),
        quantitySold: parseInt(quantitySold) || 1,
        date: localDate.toISOString(),
        notes,
        isTrade,
        ...(showId ? { showId } : {})
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'permission-denied') {
        setError("You don't have permission to perform this action.");
      } else {
        setError(err.message || 'Failed to log sale. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fca5a5' }}>
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          )}
          
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
                      <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{card.name}</span>
                        {card.language && (
                          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.1rem 0.3rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold' }}>
                            {card.language === 'English' ? 'EN' : card.language === 'Japanese' ? 'JP' : card.language === 'Chinese' ? 'CN' : card.language === 'Korean' ? 'KR' : card.language}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Qty: {card.quantity || 1} • Paid: ${card.pricePaid.toFixed(2)} 
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

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <input 
              type="checkbox" 
              id="isTrade" 
              checked={isTrade} 
              onChange={e => setIsTrade(e.target.checked)} 
              style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
            />
            <label htmlFor="isTrade" style={{ margin: 0, cursor: 'pointer' }}>Sold via Trade?</label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Sold Price (Per Unit) ($)</label>
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

            {cardId && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Quantity Sold (Max: {availableQty})</label>
                <input 
                  type="number" 
                  min="1"
                  max={availableQty}
                  step="1"
                  className="glass-input" 
                  placeholder="1"
                  value={quantitySold}
                  onChange={e => setQuantitySold(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Sale Date</label>
            <input 
              type="date" 
              className="glass-input" 
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Tag to Show (Optional)</label>
            <select 
              className="glass-input"
              value={showId}
              onChange={e => setShowId(e.target.value)}
              style={{ background: '#1e1b4b', appearance: 'auto' }}
            >
              <option value="">-- No Show --</option>
              <optgroup label="General Tags">
                <option value="Non-vended show">Non-vended show</option>
                <option value="Online/Discord">Online/Discord</option>
              </optgroup>
              <optgroup label="Registered Shows">
                {shows.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(show => (
                  <option key={show.id} value={show.id}>
                    {show.name} ({new Date(show.date).toLocaleDateString()})
                  </option>
                ))}
              </optgroup>
            </select>
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
            <button type="button" className="glass-button" onClick={onClose} disabled={isSubmitting}>Cancel</button>
            <button type="submit" className="glass-button primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Log Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
