import React, { useState } from 'react';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { parseExcelFile } from '../utils/excelParser';

interface Props {
  onClose: () => void;
}

export const SyncDataModal = ({ onClose }: Props) => {
  const syncFromExcel = useStore(state => state.syncFromExcel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { inventory, sales } = await parseExcelFile(file);
      syncFromExcel(inventory, sales);
      setSuccess(`Successfully imported ${inventory.length} cards and ${sales.length} sales!`);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to parse Excel file. Please ensure it matches the required template.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold">Sync Data</h2>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }} disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <div 
            style={{ 
              border: '2px dashed var(--glass-border)', 
              borderRadius: 'var(--border-radius-lg)', 
              padding: '3rem 2rem',
              background: 'rgba(255,255,255,0.02)',
              position: 'relative'
            }}
          >
            <UploadCloud size={48} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
            <h3 className="text-lg font-bold mb-2">Upload Excel Spreadsheet</h3>
            <p className="text-secondary text-sm mb-6">
              This will <strong>overwrite</strong> your local browser data with the contents of the Excel file to keep your partners in sync.
            </p>
            
            <input 
              type="file" 
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer',
                width: '100%',
                height: '100%'
              }}
              disabled={loading}
            />
            <button className="glass-button primary" disabled={loading}>
              {loading ? 'Processing...' : 'Select File'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', color: 'var(--success)', textAlign: 'center', fontWeight: 'bold' }}>
            {success}
          </div>
        )}
      </div>
    </div>
  );
};
