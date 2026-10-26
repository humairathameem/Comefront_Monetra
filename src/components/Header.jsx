import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function Header({ onMenu }) {
  const f = useFinance();
  const nav = useNavigate();
  const initials = f.data.settings.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  const due = f.budget.unpaid.filter((b) => b.due >= +f.today.slice(8, 10) && b.due - +f.today.slice(8, 10) <= 5).length;
  return (
    <header className="topbar">
      <button className="icon-btn only-mobile" onClick={onMenu} aria-label="Open menu"><Menu size={22} /></button>
      <label className="search"><Search size={16} />
        <input placeholder="Search transactions" value={f.search} onChange={(e) => { f.setSearch(e.target.value); nav('/transactions'); }} /></label>
      <select className="ctl" value={f.accountId} onChange={(e) => f.setAccountId(e.target.value)} aria-label="Account">
        <option value="all">All accounts</option>
        {f.data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
      </select>
      <input className="ctl month" type="month" value={f.month} onChange={(e) => e.target.value && f.setMonth(e.target.value)} aria-label="Month" />
      <button className="icon-btn" onClick={() => nav('/bills')} aria-label="Notifications" title={`${due} bill(s) due within 5 days`}><Bell size={20} />{due > 0 && <i className="dot">{due}</i>}</button>
      <button className="btn primary hide-mobile" onClick={() => f.setModal({})}><Plus size={16} /> Add Transaction</button>
      <button className="avatar" onClick={() => nav('/settings')} aria-label="Profile">{initials}</button>
    </header>
  );
}
