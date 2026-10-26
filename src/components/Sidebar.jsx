import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, Home, ShoppingBag, PiggyBank, TrendingUp, ArrowLeftRight, Banknote, CalendarClock, History, Target, Sparkles, BarChart3, Landmark, Settings as Cog, X } from 'lucide-react';
import * as P from '../pages';

export const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, page: P.Overview },
  { to: '/salary', label: 'My Salary', icon: Wallet, page: P.MySalary },
  { to: '/needs', label: 'Needs', icon: Home, page: P.Needs },
  { to: '/wants', label: 'Wants', icon: ShoppingBag, page: P.Wants },
  { to: '/savings', label: 'Savings', icon: PiggyBank, page: P.Savings },
  { to: '/investments', label: 'Investments', icon: TrendingUp, page: P.Investments },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight, page: P.Transactions },
  { to: '/cashflow', label: 'CashFlow', icon: Banknote, page: P.CashFlow },
  { to: '/bills', label: 'Bills & Commitments', icon: CalendarClock, page: P.Bills },
  { to: '/time-machine', label: 'Financial Time Machine', icon: History, page: P.FinancialTimeMachine },
  { to: '/goals', label: 'Goals & Milestones', icon: Target, page: P.Goals },
  { to: '/coach', label: 'AI Money Coach', icon: Sparkles, page: P.MoneyCoach },
  { to: '/reports', label: 'Reports & Insights', icon: BarChart3, page: P.Reports },
  { to: '/accounts', label: 'Accounts & Connections', icon: Landmark, page: P.Accounts },
  { to: '/settings', label: 'Settings', icon: Cog, page: P.Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><div><span className="wordmark">Monetra</span><small>Make every day count.</small></div>
          <button className="icon-btn only-mobile" onClick={onClose} aria-label="Close menu"><X size={20} /></button></div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <n.icon size={18} /><span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="demo-note">Demo data. Simulated connections only.</div>
      </aside>
    </>
  );
}
