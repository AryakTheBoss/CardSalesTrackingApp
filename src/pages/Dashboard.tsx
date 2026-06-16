import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
import { useStore } from '../store/useStore';
import { TrendingUp, Package, WalletCards, Calendar, BarChart3 } from 'lucide-react';

export const Dashboard = () => {
  const sales = useStore(state => state.sales);
  const inventory = useStore(state => state.inventory);
  const shows = useStore(state => state.shows);
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    // 1. Inventory counts
    const inStock = inventory.filter(c => c.status === 'in-stock');
    const slabCount = inStock.filter(c => c.type === 'slab').length;
    const rawCount = inStock.filter(c => c.type === 'raw').length;
    const sealedCount = inStock.filter(c => c.type === 'sealed').length;

    // 2. All-time stats
    let lifetimeRevenue = 0;
    let lifetimeCogs = 0;

    // 3. YTD stats
    let ytdRevenue = 0;
    let ytdCogs = 0;

    // 4. Monthly chart data
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' }),
      revenue: 0,
      cogs: 0,
      profit: 0
    }));

    // 5. Show performance
    const showPerformanceMap: Record<string, { showName: string, revenue: number, cogs: number, profit: number }> = {};

    sales.forEach(sale => {
      const card = inventory.find(c => c.id === sale.cardId);
      if (!card) return;

      const saleDate = new Date(sale.date);
      const year = saleDate.getFullYear();
      const month = saleDate.getMonth();

      // All time
      lifetimeRevenue += sale.soldPrice;
      lifetimeCogs += card.pricePaid;

      // YTD & Monthly
      if (year === currentYear) {
        ytdRevenue += sale.soldPrice;
        ytdCogs += card.pricePaid;

        monthlyData[month].revenue += sale.soldPrice;
        monthlyData[month].cogs += card.pricePaid;
        monthlyData[month].profit += (sale.soldPrice - card.pricePaid);
      }

      // Show specific
      if (sale.showId) {
        const isHardcoded = sale.showId === 'Non-vended show' || sale.showId === 'Online/Discord';
        const show = shows.find(s => s.id === sale.showId);
        const showName = show ? show.name : (isHardcoded ? sale.showId : 'Unknown Show');

        if (!showPerformanceMap[sale.showId]) {
          showPerformanceMap[sale.showId] = { showName, revenue: 0, cogs: 0, profit: 0 };
        }

        showPerformanceMap[sale.showId].revenue += sale.soldPrice;
        showPerformanceMap[sale.showId].cogs += card.pricePaid;
        showPerformanceMap[sale.showId].profit += (sale.soldPrice - card.pricePaid);
      }
    });

    const lifetimeProfit = lifetimeRevenue - lifetimeCogs;
    const ytdProfit = ytdRevenue - ytdCogs;

    const showPerformanceList = Object.values(showPerformanceMap).sort((a, b) => b.profit - a.profit);

    return {
      inventory: { slabs: slabCount, raws: rawCount, sealed: sealedCount, total: inStock.length },
      lifetime: { revenue: lifetimeRevenue, cogs: lifetimeCogs, profit: lifetimeProfit },
      ytd: { revenue: ytdRevenue, cogs: ytdCogs, profit: ytdProfit },
      monthlyData,
      showPerformance: showPerformanceList
    };
  }, [sales, inventory, shows, currentYear]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '1rem', color: '#fff', minWidth: '150px' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', color: entry.color, marginBottom: '0.25rem' }}>
              <span style={{ marginRight: '1rem' }}>{entry.name}:</span>
              <span style={{ fontWeight: 'bold' }}>${entry.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in" style={{ paddingBottom: '3rem' }}>
      <div className="view-header flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-secondary mt-2">Deep dive into your business performance and metrics</p>
        </div>
      </div>

      {/* INVENTORY SNAPSHOT */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Package className="text-accent-primary" /> Inventory Snapshot
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #3b82f6' }}>
          <p className="text-secondary text-sm font-medium">Slabs</p>
          <h3 className="text-3xl font-bold mt-2">{stats.inventory.slabs}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #f59e0b' }}>
          <p className="text-secondary text-sm font-medium">Raw Cards</p>
          <h3 className="text-3xl font-bold mt-2">{stats.inventory.raws}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #10b981' }}>
          <p className="text-secondary text-sm font-medium">Sealed Products</p>
          <h3 className="text-3xl font-bold mt-2">{stats.inventory.sealed}</h3>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', borderTop: '3px solid #8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
          <p className="text-sm font-medium" style={{ color: '#c4b5fd' }}>Total Items in Stock</p>
          <h3 className="text-3xl font-bold mt-2" style={{ color: '#ddd6fe' }}>{stats.inventory.total}</h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* LIFETIME METRICS */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <WalletCards className="text-accent-primary" /> Lifetime Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span className="text-secondary">Total Sales Revenue</span>
              <span className="text-xl font-bold">${stats.lifetime.revenue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span className="text-secondary">Total Cost of Goods (COGS)</span>
              <span className="text-xl font-bold" style={{ color: '#f87171' }}>${stats.lifetime.cogs.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <span className="font-medium text-success">Net Profit (All Time)</span>
              <span className="text-2xl font-bold text-success">${stats.lifetime.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* YEAR TO DATE METRICS */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Calendar className="text-accent-primary" /> Year to Date ({currentYear})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span className="text-secondary">YTD Sales Revenue</span>
              <span className="text-xl font-bold">${stats.ytd.revenue.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <span className="text-secondary">YTD Cost of Goods (COGS)</span>
              <span className="text-xl font-bold" style={{ color: '#f87171' }}>${stats.ytd.cogs.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <span className="font-medium" style={{ color: '#60a5fa' }}>Net Profit (YTD)</span>
              <span className="text-2xl font-bold" style={{ color: '#60a5fa' }}>${stats.ytd.profit.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* MONTHLY CHART */}
      <div className="glass-panel table-responsive-wrapper" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BarChart3 className="text-accent-primary" /> Monthly Financials ({currentYear})
        </h2>
        <div style={{ width: '100%', minWidth: '600px', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={stats.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `$${value}`} tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cogs" name="COGS" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SHOW PERFORMANCE */}
      <div className="glass-panel table-responsive-wrapper" style={{ padding: '1.5rem' }}>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <TrendingUp className="text-accent-primary" /> Show Performance Breakdown
        </h2>

        {stats.showPerformance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            No show data available yet. Tag your sales to shows to see performance metrics here!
          </div>
        ) : (
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem' }}>Show Name</th>
                <th style={{ padding: '1rem' }}>Total Revenue</th>
                <th style={{ padding: '1rem' }}>Total COGS</th>
                <th style={{ padding: '1rem' }}>Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {stats.showPerformance.map((show, idx) => (
                <tr
                  key={idx}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '1rem' }}>
                    <div className="font-bold text-lg">{show.showName}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>${show.revenue.toFixed(2)}</td>
                  <td style={{ padding: '1rem', color: '#fca5a5' }}>${show.cogs.toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={show.profit >= 0 ? "font-bold text-success" : "font-bold text-danger"}>
                      ${show.profit.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};
