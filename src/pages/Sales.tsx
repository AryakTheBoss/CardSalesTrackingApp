import { useState } from 'react';
import { useStore, type Sale } from '../store/useStore';
import { Plus, Edit2, Trash2, Info } from 'lucide-react';
import { AddSaleModal } from '../components/AddSaleModal';
import { EditSaleModal } from '../components/EditSaleModal';
import { TradeRuleModal } from '../components/TradeRuleModal';

export const Sales = () => {
  const sales = useStore(state => state.sales) || [];
  const inventory = useStore(state => state.inventory) || [];
  const shows = useStore(state => state.shows) || [];
  const deleteSale = useStore(state => state.deleteSale);
  const isGuest = useStore(state => state.isGuest);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [sortOption, setSortOption] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (saleId: string) => {
    if (confirm('Are you sure you want to delete this sale? The card will be returned to your inventory.')) {
      deleteSale(saleId);
    }
  };

  const filteredSales = sales.filter(sale => {
    const card = inventory.find(c => c.id === sale.cardId);
    if (!card) return false;
    return card.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOption === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    
    const qtyA = a.quantitySold || 1;
    const qtyB = b.quantitySold || 1;
    const revA = a.soldPrice * qtyA;
    const revB = b.soldPrice * qtyB;

    if (sortOption === 'sale-desc') return revB - revA;
    if (sortOption === 'sale-asc') return revA - revB;
    
    const cardA = inventory.find(c => c.id === a.cardId);
    const cardB = inventory.find(c => c.id === b.cardId);
    
    const buyA = (cardA ? cardA.pricePaid : 0) * qtyA;
    const buyB = (cardB ? cardB.pricePaid : 0) * qtyB;
    
    if (sortOption === 'buy-desc') return buyB - buyA;
    if (sortOption === 'buy-asc') return buyA - buyB;
    
    const profitA = revA - buyA;
    const profitB = revB - buyB;
    
    if (sortOption === 'profit-desc') return profitB - profitA;
    if (sortOption === 'profit-asc') return profitA - profitB;
    
    return 0;
  });

  return (
    <div className="animate-in">
      <div className="view-header flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-secondary mt-2">Track your sold cards and profits</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="glass-button" 
            onClick={() => setIsHelpModalOpen(true)}
            title="Trade Rules Help"
            style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Info size={18} />
            <span className="hidden sm:inline">Trade Rule Help</span>
          </button>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by card name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ minWidth: '200px', flex: 1 }}
          />
          <select 
            className="glass-input" 
            style={{ width: 'auto', background: '#1e1b4b', appearance: 'auto', padding: '0.5rem 1rem', height: 'fit-content' }}
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="date-desc">Newest Sold</option>
            <option value="date-asc">Oldest Sold</option>
            <option value="profit-desc">Highest Profit</option>
            <option value="profit-asc">Lowest Profit</option>
            <option value="sale-desc">Highest Sale Price</option>
            <option value="sale-asc">Lowest Sale Price</option>
            <option value="buy-desc">Highest Buy Price</option>
            <option value="buy-asc">Lowest Buy Price</option>
          </select>
          {!isGuest && (
            <button className="glass-button primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} />
              Log Sale
            </button>
          )}
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">{sales.length === 0 ? "No sales logged yet." : "No matching sales found."}</p>
          {sales.length === 0 && !isGuest && <button className="glass-button" onClick={() => setIsModalOpen(true)}>Log your first sale</button>}
        </div>
      ) : (
        <div className="glass-panel table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Card</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Paid</th>
                <th style={{ padding: '1rem' }}>Sold</th>
                <th style={{ padding: '1rem' }}>Profit</th>
                {!isGuest && <th style={{ padding: '1rem', width: '100px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedSales.map(sale => {
                const card = inventory.find(c => c.id === sale.cardId);
                const show = shows.find(s => s.id === sale.showId);
                const isHardcodedShow = sale.showId === 'Non-vended show' || sale.showId === 'Online/Discord';
                const showName = show ? show.name : (isHardcodedShow ? sale.showId : null);
                
                const qtySold = sale.quantitySold || 1;
                const profitPerUnit = card ? sale.soldPrice - card.pricePaid : 0;
                const totalProfit = profitPerUnit * qtySold;
                
                return (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div className="font-medium">{card?.name || 'Unknown Card'}</div>
                      <div className="text-xs text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {showName && (
                          <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.1rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {sale.showId === 'Online/Discord' ? '💻' : '🎪'} {showName}
                          </span>
                        )}
                        {sale.isTrade && (
                          <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '0.1rem 0.4rem', borderRadius: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                            🔄 Traded
                          </span>
                        )}
                        <span>{sale.notes}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      ${card?.pricePaid.toFixed(2)}
                      {qtySold > 1 && <span className="text-xs text-secondary ml-1">ea</span>}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {qtySold > 1 && <span className="text-secondary mr-1 font-medium">({qtySold}x)</span>}
                      ${sale.soldPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={totalProfit >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: '600' }}>
                        {totalProfit >= 0 ? '+' : '-'}${Math.abs(totalProfit).toFixed(2)}
                      </span>
                    </td>
                    {!isGuest && (
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="glass-button" 
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}
                            onClick={() => setSelectedSale(sale)}
                            title="Edit Sale"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="glass-button" 
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}
                            onClick={() => handleDelete(sale.id)}
                            title="Delete Sale"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && <AddSaleModal onClose={() => setIsModalOpen(false)} />}
      {isHelpModalOpen && <TradeRuleModal onClose={() => setIsHelpModalOpen(false)} />}
      {selectedSale && <EditSaleModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
    </div>
  );
};
