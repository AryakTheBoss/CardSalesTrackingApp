import { useState } from 'react';
import { useStore, type Show } from '../store/useStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AddShowModal } from '../components/AddShowModal';
import { EditShowModal } from '../components/EditShowModal';

export const Shows = () => {
  const shows = useStore(state => state.shows) || [];
  const deleteShow = useStore(state => state.deleteShow);
  const isGuest = useStore(state => state.isGuest);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [sortOption, setSortOption] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (showId: string) => {
    if (confirm('Are you sure you want to delete this show registration?')) {
      deleteShow(showId);
    }
  };

  const filteredShows = shows.filter(show =>
    show.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedShows = [...filteredShows].sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOption === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortOption === 'cost-desc') return (b.tables * b.tableCost) - (a.tables * a.tableCost);
    if (sortOption === 'cost-asc') return (a.tables * a.tableCost) - (b.tables * b.tableCost);
    return 0;
  });

  const getShowStatus = (dateStr: string) => {
    const showDate = new Date(dateStr);
    const today = new Date();
    
    // Normalize to midnight for accurate day comparison
    showDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (showDate.getTime() === today.getTime()) return 'Today';
    if (showDate.getTime() > today.getTime()) return 'Upcoming';
    return 'Completed';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Today': return { bg: 'rgba(234, 179, 8, 0.2)', text: '#facc15' };
      case 'Upcoming': return { bg: 'rgba(59, 130, 246, 0.2)', text: '#60a5fa' };
      case 'Completed': return { bg: 'rgba(16, 185, 129, 0.2)', text: '#4ade80' };
      default: return { bg: 'rgba(255,255,255,0.1)', text: '#fff' };
    }
  };

  return (
    <div className="animate-in">
      <div className="view-header flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Show Registrations</h1>
          <p className="text-secondary mt-2">Manage your upcoming and past events</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search shows..."
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
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="cost-desc">Highest Total Cost</option>
            <option value="cost-asc">Lowest Total Cost</option>
          </select>
          {!isGuest && (
            <button className="glass-button primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={20} />
              Add Show
            </button>
          )}
        </div>
      </div>

      {filteredShows.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">{shows.length === 0 ? "No shows registered yet." : "No matching shows found."}</p>
          {shows.length === 0 && !isGuest && <button className="glass-button" onClick={() => setIsAddModalOpen(true)}>Register for your first show</button>}
        </div>
      ) : (
        <div className="glass-panel table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Show Name</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Tables</th>
                <th style={{ padding: '1rem' }}>Table Cost</th>
                <th style={{ padding: '1rem' }}>Total Cost</th>
                {!isGuest && <th style={{ padding: '1rem', width: '100px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedShows.map(show => {
                const totalCost = show.tables * show.tableCost;

                return (
                  <tr
                    key={show.id}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{show.name}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: getStatusColor(getShowStatus(show.date)).bg,
                        color: getStatusColor(getShowStatus(show.date)).text,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {getShowStatus(show.date)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(show.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>{show.tables}</td>
                    <td style={{ padding: '1rem' }}>${show.tableCost.toFixed(2)}</td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--danger)' }}>
                      -${totalCost.toFixed(2)}
                    </td>
                    {!isGuest && (
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="glass-button"
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}
                            onClick={() => setSelectedShow(show)}
                            title="Edit Show"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="glass-button"
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}
                            onClick={() => handleDelete(show.id)}
                            title="Delete Show"
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

      {isAddModalOpen && <AddShowModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedShow && <EditShowModal show={selectedShow} onClose={() => setSelectedShow(null)} />}
    </div>
  );
};
