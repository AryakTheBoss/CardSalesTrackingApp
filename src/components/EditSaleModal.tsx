import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useStore, type Sale } from '../store/useStore';

interface Props {
  sale: Sale;
  onClose: () => void;
}

export const EditSaleModal = ({ sale, onClose }: Props) => {
  const inventory = useStore(state => state.inventory) || [];
  const shows = useStore(state => state.shows) || [];
  const updateSale = useStore(state => state.updateSale);
  const deleteSale = useStore(state => state.deleteSale);
  
  const d = new Date(sale.date);
  const localString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const [soldPrice, setSoldPrice] = useState(sale.soldPrice.toString());
  const [date, setDate] = useState(localString);
  const [notes, setNotes] = useState(sale.notes || '');
  const [showId, setShowId] = useState(sale.showId || '');

  const card = inventory.find(c => c.id === sale.cardId);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!soldPrice) return;

    const [year, month, day] = date.split('-');
    const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    updateSale(sale.id, {
      soldPrice: parseFloat(soldPrice),
      date: localDate.toISOString(),
      notes,
      showId: showId || undefined
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this sale? The card will be returned to your inventory.')) {
      deleteSale(sale.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Edit Sale</h2>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Card Sold</label>
            <input 
              type="text" 
              className="glass-input" 
              value={card ? card.name : 'Unknown Card'}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
            <button 
              type="button" 
              className="glass-button" 
              style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              onClick={handleDelete}
            >
              <Trash2 size={18} style={{ marginRight: '0.5rem' }} />
              Delete Sale
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
