import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import { TrendingUp, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const sales = useStore(state => state.sales);
  const inventory = useStore(state => state.inventory);
  const getProfitByMonth = useStore(state => state.getProfitByMonth);
  const currentYear = new Date().getFullYear();
  
  const data = useMemo(() => getProfitByMonth(currentYear), [getProfitByMonth, currentYear, sales, inventory]);
  
  const totalProfit = data.reduce((sum, item) => sum + item.profit, 0);

  return (
    <div className="animate-in">
      <div className="flex-row justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-secondary mt-2">Overview of your collection's performance in {currentYear}</p>
        </div>
      </div>

      <div className="flex-row gap-4 mb-8" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-panel p-6 flex-1" style={{ flex: 1, padding: '1.5rem' }}>
          <div className="flex-row items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
              <TrendingUp className="text-success" size={24} />
            </div>
            <div>
              <p className="text-secondary text-sm">Total Profit YTD</p>
              <h2 className="text-3xl font-bold text-success">
                ${totalProfit.toFixed(2)}
              </h2>
            </div>
          </div>
        </div>
        
        {/* Placeholder for other stats */}
        <div className="glass-panel p-6 flex-1" style={{ flex: 1, padding: '1.5rem' }}>
          <div className="flex-row items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="p-3 rounded-lg" style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
              <DollarSign style={{ color: 'var(--accent-primary)' }} size={24} />
            </div>
            <div>
              <p className="text-secondary text-sm">Best Month</p>
              <h2 className="text-3xl font-bold">
                {data.reduce((max, d) => d.profit > max.profit ? d : max, data[0])?.month || 'N/A'}
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6" style={{ padding: '1.5rem' }}>
        <h3 className="text-xl font-bold mb-6">Monthly Profit</h3>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Bar dataKey="profit" fill="var(--success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
