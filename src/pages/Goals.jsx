import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

const eta = (g) => { if (g.saved >= g.target) return 'Reached'; if (!g.monthly) return 'Set a monthly amount'; const m = Math.ceil((g.target - g.saved) / g.monthly); const d = new Date(); d.setMonth(d.getMonth() + m); return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); };
function GoalList({ savings }) {
  const f = useFinance(); const [n, setN] = useState({ name: '', target: '', monthly: '' });
  const add = (id, amt) => f.patch('goals', (l) => l.map((g) => (g.id === id ? { ...g, saved: g.saved + amt, history: [...(g.history || []), { date: f.today, amount: amt }] } : g)));
  const upd = (id, k, v) => f.patch('goals', (l) => l.map((g) => (g.id === id ? { ...g, [k]: Math.max(0, +v || 0) } : g)));
  return (<>
    {f.data.goals.map((g) => { const p = Math.min(100, (g.saved / g.target) * 100); return (
      <ChartCard key={g.id} title={g.name} action={<b>{Math.round(p)}%</b>}>
        <div className="track tall"><div style={{ width: `${p}%` }} /></div>
        <div className="row"><span>{inr(g.saved)} of {inr(g.target)}</span><span>Projected: {eta(g)}</span></div>
        <div className="edit-row"><label className="inline">Monthly<input className="mini" type="number" value={g.monthly} onChange={(e) => upd(g.id, 'monthly', e.target.value)} /></label>
          <button className="btn" onClick={() => add(g.id, g.monthly)}>Contribute {inr(g.monthly)}</button>
          <button className="btn ghost" onClick={() => f.patch('goals', (l) => l.filter((x) => x.id !== g.id))}>Delete</button></div>
        {savings && g.history?.length > 0 && <small className="muted">Contributions: {g.history.slice(-4).map((h) => `${h.date} ${inr(h.amount)}`).join(' · ')}</small>}
      </ChartCard>); })}
    <ChartCard title="New goal"><div className="edit-row"><input placeholder="Goal name" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /><input type="number" placeholder="Target ₹" value={n.target} onChange={(e) => setN({ ...n, target: e.target.value })} /><input type="number" placeholder="Monthly ₹" value={n.monthly} onChange={(e) => setN({ ...n, monthly: e.target.value })} />
      <button className="btn primary" onClick={() => n.name && +n.target > 0 && (f.patch('goals', (l) => [...l, { id: `g${Date.now()}`, name: n.name, target: +n.target, saved: 0, monthly: +n.monthly || 0 }]), setN({ name: '', target: '', monthly: '' }))}>Add goal</button></div></ChartCard></>);
}
export function Savings() {
  const f = useFinance(); const b = f.budget;
  return (<><PageHeader title="Savings" sub="Protected money is never counted as spendable." />
    <div className="grid kpis"><StatCard label="Savings balance" value={inr(b.savedBalance)} /><StatCard label="Protected this month" value={inr(b.protectedTarget)} /><StatCard label="Moved so far" value={inr(b.savedIn)} /></div><GoalList savings /></>);
}
export const Goals = () => <><PageHeader title="Goals & Milestones" sub="Estimated dates assume your monthly contribution stays steady." /><GoalList /></>;
