import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus } from 'lucide-react';
import { AddSaleModal } from '../components/AddSaleModal';

export const Sales = () => {
  const sales = useStore(state => state.sales) || [];
  const inventory = useStore(state => state.inventory) || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-in">
      <div className="flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-secondary mt-2">Track your sold cards and profits</p>
        </div>
        <button className="glass-button primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Log Sale
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">No sales logged yet.</p>
          <button className="glass-button" onClick={() => setIsModalOpen(true)}>Log your first sale</button>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Card</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Paid</th>
                <th style={{ padding: '1rem' }}>Sold</th>
                <th style={{ padding: '1rem' }}>Profit</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => {
                const card = inventory.find(c => c.id === sale.cardId);
                const profit = card ? sale.soldPrice - card.pricePaid : 0;
                
                return (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="font-medium">{card?.name || 'Unknown Card'}</div>
                      <div className="text-xs text-secondary">{sale.notes}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>${card?.pricePaid.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>${sale.soldPrice.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={profit >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: '600' }}>
                        {profit >= 0 ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <AddSaleModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
