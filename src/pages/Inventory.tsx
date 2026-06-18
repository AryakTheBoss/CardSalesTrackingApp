import { useState } from 'react';
import { useStore, type CardType, type Card } from '../store/useStore';
import { Plus } from 'lucide-react';
import { AddCardModal } from '../components/AddCardModal';
import { EditCardModal } from '../components/EditCardModal';

export const Inventory = () => {
  const inventory = useStore(state => state.inventory) || [];
  const isGuest = useStore(state => state.isGuest);
  const [activeTab, setActiveTab] = useState<CardType>('slab');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [sortOption, setSortOption] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInventory = inventory.filter(card => {
    const matchesTab = card.type === activeTab && card.status === 'in-stock';
    const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    if (sortOption === 'date-asc') return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
    if (sortOption === 'price-desc') return b.pricePaid - a.pricePaid;
    if (sortOption === 'price-asc') return a.pricePaid - b.pricePaid;
    return 0;
  });
  
  return (
    <div className="animate-in">
      <div className="view-header flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-secondary mt-2">Manage your current collection</p>
        </div>
        {!isGuest && (
          <button className="glass-button primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            Add Card
          </button>
        )}
      </div>

      <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div className="glass-panel p-2" style={{ display: 'inline-flex', padding: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`glass-button ${activeTab === 'slab' ? 'bg-white/20' : 'border-transparent'}`}
            style={{ border: activeTab === 'slab' ? '' : 'none', background: activeTab === 'slab' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setActiveTab('slab')}
          >
            Slabs (Graded)
          </button>
          <button
            className={`glass-button ${activeTab === 'raw' ? 'bg-white/20' : 'border-transparent'}`}
            style={{ border: activeTab === 'raw' ? '' : 'none', background: activeTab === 'raw' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setActiveTab('raw')}
          >
            Raw Cards
          </button>
          <button
            className={`glass-button ${activeTab === 'sealed' ? 'bg-white/20' : 'border-transparent'}`}
            style={{ border: activeTab === 'sealed' ? '' : 'none', background: activeTab === 'sealed' ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            onClick={() => setActiveTab('sealed')}
          >
            Sealed Products
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: '200px', flex: 1 }}
          />
          <select
            className="glass-input"
            style={{ width: 'auto', background: '#1e1b4b', appearance: 'auto', padding: '0.5rem 1rem' }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date-desc">Newest Added</option>
            <option value="date-asc">Oldest Added</option>
            <option value="price-desc">Highest Price</option>
            <option value="price-asc">Lowest Price</option>
          </select>
        </div>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">No {activeTab} cards in inventory.</p>
          {!isGuest && <button className="glass-button" onClick={() => setIsModalOpen(true)}>Add your first card</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {sortedInventory.map(card => (
            <div
              key={card.id}
              className="glass-panel p-3"
              style={{ padding: '0.75rem', cursor: isGuest ? 'default' : 'pointer', transition: 'transform 0.2s' }}
              onClick={() => {
                if (!isGuest) setSelectedCard(card);
              }}
              onMouseOver={e => { if (!isGuest) e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
                <h3 className="font-bold text-base" style={{ flex: 1, lineHeight: '1.2' }}>
                  {card.name}
                  {(card.quantity || 1) > 1 && (
                    <span style={{ display: 'inline-block', fontSize: '0.75rem', marginLeft: '0.5rem', marginTop: '0.1rem', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px', verticalAlign: 'middle', fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                      Qty: {card.quantity}
                    </span>
                  )}
                </h3>
                <span className="text-success font-semibold text-sm" style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                  ${card.pricePaid.toFixed(2)}
                  {(card.quantity || 1) > 1 && <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '1px' }}>/unit</span>}
                </span>
              </div>
              {card.type === 'slab' && (card.gradingCompany || card.grade) && (
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', padding: '0.15rem 0.4rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {card.gradingCompany} {card.grade}
                </div>
              )}
              {card.type === 'raw' && card.condition && (
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', padding: '0.15rem 0.4rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  Condition: {card.condition}
                </div>
              )}
              <p className="text-xs text-secondary" style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {card.notes || 'No notes.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <AddCardModal onClose={() => setIsModalOpen(false)} />}
      {selectedCard && <EditCardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
};
