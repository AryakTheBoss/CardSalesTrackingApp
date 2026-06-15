import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, WalletCards, BadgeDollarSign, RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import { SyncDataModal } from './SyncDataModal';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex-row items-center gap-4 p-4 rounded-lg transition-all duration-200 mb-2 ${
        isActive 
          ? 'glass-panel bg-white/10 text-white shadow-lg' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`
    }
    style={{ display: 'flex', textDecoration: 'none' }}
  >
    <Icon size={24} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const AppLayout = () => {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col" style={{ width: '250px', border: '1px solid var(--glass-border)' }}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gradient">Apex Collects</h1>
          <p className="text-sm text-secondary mt-1">Inventory Tracker</p>
        </div>
        
        <nav className="flex-1 px-4 mt-8 flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={WalletCards} label="Inventory" />
          <NavItem to="/sales" icon={BadgeDollarSign} label="Sales" />
        </nav>
        
        <div className="p-4 border-t" style={{ borderTop: '1px solid var(--glass-border)' }}>
          <button 
            className="glass-button w-full flex-row justify-center items-center gap-2" 
            style={{ width: '100%' }}
            onClick={() => setIsSyncModalOpen(true)}
          >
            <RefreshCw size={18} />
            Sync Excel
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {isSyncModalOpen && <SyncDataModal onClose={() => setIsSyncModalOpen(false)} />}
    </div>
  );
};
