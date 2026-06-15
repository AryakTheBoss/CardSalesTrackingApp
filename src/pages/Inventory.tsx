import { useState } from 'react';
import { useStore, type CardType } from '../store/useStore';
import { Plus } from 'lucide-react';
import { AddCardModal } from '../components/AddCardModal';

export const Inventory = () => {
  const inventory = useStore(state => state.inventory) || [];
  const [activeTab, setActiveTab] = useState<CardType>('slab');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredInventory = inventory.filter(card => card.type === activeTab && card.status === 'in-stock');

  return (
    <div className="animate-in">
      <div className="flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-secondary mt-2">Manage your current collection</p>
        </div>
        <button className="glass-button primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Add Card
        </button>
      </div>

      <div className="glass-panel p-2 mb-6" style={{ display: 'inline-flex', padding: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={`glass-button ${activeTab === 'slab' ? 'bg-white/20' : 'border-transparent'}`} 
          style={{ border: activeTab === 'slab' ? '' : 'none' }}
          onClick={() => setActiveTab('slab')}
        >
          Slabs (Graded)
        </button>
        <button 
          className={`glass-button ${activeTab === 'raw' ? 'bg-white/20' : 'border-transparent'}`} 
          style={{ border: activeTab === 'raw' ? '' : 'none' }}
          onClick={() => setActiveTab('raw')}
        >
          Raw Cards
        </button>
      </div>

      {filteredInventory.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">No {activeTab} cards in inventory.</p>
          <button className="glass-button" onClick={() => setIsModalOpen(true)}>Add your first card</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filteredInventory.map(card => (
            <div key={card.id} className="glass-panel p-5" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 className="font-bold text-lg">{card.name}</h3>
                <span className="text-success font-semibold">${card.pricePaid.toFixed(2)}</span>
              </div>
              {card.type === 'slab' && (card.gradingCompany || card.grade) && (
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', padding: '0.25rem 0.5rem', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
                  {card.gradingCompany} {card.grade}
                </div>
              )}
              {card.type === 'raw' && card.condition && (
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--success)' }}>
                  Condition: {card.condition}
                </div>
              )}
              <p className="text-sm text-secondary mb-4">{card.notes || 'No notes.'}</p>
              <div className="text-xs text-muted">
                Added: {new Date(card.dateAdded).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && <AddCardModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
