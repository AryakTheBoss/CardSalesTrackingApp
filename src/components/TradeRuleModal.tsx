import { X, Info } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const TradeRuleModal = ({ onClose }: Props) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ padding: '2rem', maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={24} color="var(--accent-primary)" />
            <h2 className="text-2xl font-bold">Trade Accounting Rules</h2>
          </div>
          <button onClick={onClose} className="glass-button" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4" style={{ lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          <p>
            When processing a trade, you should keep things simple by tracking <strong>Cash Flow</strong>. This ensures your dashboard metrics perfectly align with your real-world bank account.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 className="font-bold text-white mb-2" style={{ fontSize: '1.1rem' }}>The Golden Rules</h3>
            <p>
              <strong>1. Outgoing Card(s):</strong> The "Sold Price" should be ONLY the physical cash you received in the trade.
            </p>
            <p className="mt-3">
              <strong>2. Incoming Card(s):</strong> Calculate your new "Price Paid" using this formula:<br/>
              <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.85rem', display: 'inline-block', marginTop: '0.5rem', color: '#a78bfa' }}>
                (Price Paid for Outgoing Cards) - (Cash Received)
              </code>
            </p>
            <ul style={{ listStyleType: 'circle', paddingLeft: '2.5rem', marginTop: '0.5rem' }} className="space-y-1 text-sm">
              <li>If the result is <strong>negative</strong>, enter <strong>$0</strong>.</li>
              <li>If the result is <strong>positive</strong>, enter that number (or split it evenly if you received multiple cards).</li>
            </ul>
          </div>

          <h3 className="font-bold text-white" style={{ fontSize: '1.1rem', marginTop: '2rem', marginBottom: '1rem' }}>Example Scenarios</h3>
          
          <div className="space-y-6">
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px' }}>
              <h4 className="font-bold text-white text-sm mb-2">Scenario A (Negative Result)</h4>
              <p className="text-sm mb-2">
                You trade away a Charizard (cost basis $140).<br />
                You receive $800 cash + a Sabrina's Gengar.
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }} className="space-y-1 text-sm">
                <li><strong>Charizard Sale:</strong> Paid $140 / Sold $800.</li>
                <li><strong>Gengar Buy Price:</strong> $140 - $800 = -$660. Since it's negative, enter <strong>$0</strong>.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '6px' }}>
              <h4 className="font-bold text-white text-sm mb-2">Scenario B (Positive Result)</h4>
              <p className="text-sm mb-2">
                You trade away a Lugia (cost basis $100).<br />
                You receive $20 cash + two Pikachus.
              </p>
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }} className="space-y-1 text-sm">
                <li><strong>Lugia Sale:</strong> Paid $100 / Sold $20.</li>
                <li><strong>Pikachu Buy Price:</strong> $100 - $20 = $80. Split evenly across 2 cards = <strong>$40 each</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
          <button className="glass-button primary" onClick={onClose}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
