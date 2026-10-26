import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../engine/budgetEngine';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';
import { weeklySpend } from './Overview';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Bucket({ kind, title, sub }) {
  const f = useFinance();
  const cats = Object.keys(CATEGORIES).filter((c) => CATEGORIES[c] === kind && f.data.settings.budgets[c] !== undefined);
  const limit = (c) => f.data.settings.budgets[c] || 0;
  const spent = cats.reduce((s, c) => s + (f.spend[c] || 0), 0), cap = cats.reduce((s, c) => s + limit(c), 0);
  const setLimit = (c, v) => f.setSettings({ budgets: { ...f.data.settings.budgets, [c]: Math.max(0, +v || 0) } });
  const items = f.data.transactions.filter((t) => CATEGORIES[t.category] === kind);
  return (<>
    <PageHeader title={title} sub={sub} />
    <div className="grid kpis"><StatCard label="Budget" value={inr(cap)} /><StatCard label="Spent" value={inr(spent)} /><StatCard label="Remaining" value={inr(cap - spent)} tone={cap - spent < 0 ? 'bad' : ''} /></div>
    <div className="grid two">
      <ChartCard title="Category budgets">{cats.map((c) => { const p = Math.min(100, ((f.spend[c] || 0) / (limit(c) || 1)) * 100); return (
        <div className="cat" key={c}><div className="row"><b>{c}</b><span>{inr(f.spend[c] || 0)} of <input className="mini" type="number" value={limit(c)} onChange={(e) => setLimit(c, e.target.value)} aria-label={`${c} limit`} /></span></div>
          <div className="track"><div className={p >= 100 ? 'over' : p > 85 ? 'warn' : ''} style={{ width: `${p}%` }} /></div><small>{inr(limit(c) - (f.spend[c] || 0))} remaining</small></div>); })}</ChartCard>
      <ChartCard title="Weekly trend"><div className="chart"><ResponsiveContainer><BarChart data={weeklyKind(items, f.month)}><XAxis dataKey="name" tickLine={false} axisLine={false} /><Tooltip formatter={(v) => inr(v)} /><Bar dataKey="spend" fill="#603A2A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartCard>
    </div></>);
}
const weeklyKind = (items, month) => weeklySpend(items, month, null);
export const Needs = () => <Bucket kind="needs" title="Needs" sub="Rent, groceries, utilities and transport." />;
export const Wants = () => <Bucket kind="wants" title="Wants" sub="Shopping, dining and entertainment." />;
