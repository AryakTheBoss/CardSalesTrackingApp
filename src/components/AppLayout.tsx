import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, WalletCards, BadgeDollarSign, RefreshCw, LogOut } from 'lucide-react';
import React, { useState } from 'react';
import { SyncDataModal } from './SyncDataModal';
import { auth } from '../config/firebase';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item flex-row items-center gap-4 rounded-lg transition-all duration-200 ${isActive
        ? 'glass-panel shadow-lg active'
        : ''
      }`
    }
  >
    <Icon size={28} />
    <span className="font-medium text-lg">{label}</span>
  </NavLink>
);

export const AppLayout = () => {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel m-4 flex flex-col" style={{ border: '1px solid var(--glass-border)' }}>
        <div className="sidebar-header p-6" style={{ textAlign: 'center' }}>
          <h1 className="text-2xl font-bold text-gradient">Apex Collects</h1>
          <p className="text-sm text-secondary mt-1">Inventory Tracker</p>
        </div>

        <nav className="sidebar-nav flex-1 flex flex-col">
          <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/inventory" icon={WalletCards} label="Inventory" />
          <NavItem to="/sales" icon={BadgeDollarSign} label="Sales" />
        </nav>

        <div className="sidebar-footer border-t" style={{ borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
          <button
            className="glass-button w-full flex-row justify-center items-center gap-2"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
            onClick={() => setIsSyncModalOpen(true)}
            disabled={true}
          >
            <RefreshCw size={22} />
            Sync Excel
          </button>

          <button
            className="glass-button w-full flex-row justify-center items-center gap-2"
            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            onClick={() => auth.signOut()}
          >
            <LogOut size={22} />
            Sign Out
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
