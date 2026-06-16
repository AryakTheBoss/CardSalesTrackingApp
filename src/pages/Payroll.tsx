import { useState } from 'react';
import { useStore, type Shift } from '../store/useStore';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AddShiftModal } from '../components/AddShiftModal';
import { EditShiftModal } from '../components/EditShiftModal';

export const Payroll = () => {
  const shifts = useStore(state => state.shifts) || [];
  const shows = useStore(state => state.shows) || [];
  const deleteShift = useStore(state => state.deleteShift);
  const isGuest = useStore(state => state.isGuest);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [sortOption, setSortOption] = useState('date-desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (shiftId: string) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      deleteShift(shiftId);
    }
  };

  const filteredShifts = shifts.filter(shift => 
    shift.employee.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedShifts = [...filteredShifts].sort((a, b) => {
    if (sortOption === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortOption === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    
    const payoutA = (a.hours * a.hourlyRate) + a.bonus;
    const payoutB = (b.hours * b.hourlyRate) + b.bonus;
    
    if (sortOption === 'payout-desc') return payoutB - payoutA;
    if (sortOption === 'payout-asc') return payoutA - payoutB;
    
    return 0;
  });

  return (
    <div className="animate-in">
      <div className="view-header flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-secondary mt-2">Manage employee shifts and payouts</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="glass-input"
            placeholder="Search by employee name..."
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
            <option value="payout-desc">Highest Payout</option>
            <option value="payout-asc">Lowest Payout</option>
          </select>
          {!isGuest && (
            <button className="glass-button primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={20} />
              Add Shift
            </button>
          )}
        </div>
      </div>

      {filteredShifts.length === 0 ? (
        <div className="glass-panel p-12 text-center" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="text-secondary mb-4">{shifts.length === 0 ? "No shifts logged yet." : "No matching shifts found."}</p>
          {shifts.length === 0 && !isGuest && <button className="glass-button" onClick={() => setIsAddModalOpen(true)}>Log your first shift</button>}
        </div>
      ) : (
        <div className="glass-panel table-responsive-wrapper">
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Employee</th>
                <th style={{ padding: '1rem' }}>Show</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Hours</th>
                <th style={{ padding: '1rem' }}>Rate</th>
                <th style={{ padding: '1rem' }}>Bonus</th>
                <th style={{ padding: '1rem' }}>Total Payout</th>
                <th style={{ padding: '1rem' }}>Status</th>
                {!isGuest && <th style={{ padding: '1rem', width: '100px' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedShifts.map(shift => {
                const show = shows.find(s => s.id === shift.showId);
                const totalPayout = (shift.hours * shift.hourlyRate) + shift.bonus;
                
                return (
                  <tr 
                    key={shift.id} 
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div className="font-bold text-lg">{shift.employee}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {show?.name || 'Unknown Show'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(shift.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>{shift.hours} hrs</td>
                    <td style={{ padding: '1rem' }}>${shift.hourlyRate.toFixed(2)}/hr</td>
                    <td style={{ padding: '1rem' }}>${shift.bonus.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="font-bold text-success">
                        ${totalPayout.toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: shift.status === 'Paid' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: shift.status === 'Paid' ? '#4ade80' : '#facc15',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {shift.status}
                      </span>
                    </td>
                    {!isGuest && (
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="glass-button" 
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none' }}
                            onClick={() => setSelectedShift(shift)}
                            title="Edit Shift"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="glass-button" 
                            style={{ padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--danger)' }}
                            onClick={() => handleDelete(shift.id)}
                            title="Delete Shift"
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

      {isAddModalOpen && <AddShiftModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedShift && <EditShiftModal shift={selectedShift} onClose={() => setSelectedShift(null)} />}
    </div>
  );
};
