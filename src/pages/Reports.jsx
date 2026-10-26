import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { categorySpend } from '../engine/budgetEngine';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

const prevMonth = (m) => { const d = new Date(+m.slice(0, 4), +m.slice(5, 7) - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
export default function Reports() {
  const f = useFinance(); const pm = prevMonth(f.month);
  const cur = categorySpend(f.data.transactions, f.month, f.accountIds), prev = categorySpend(f.data.transactions, pm, f.accountIds);
  const data = [...new Set([...Object.keys(cur), ...Object.keys(prev)])].map((c) => ({ name: c, [f.month]: cur[c] || 0, [pm]: prev[c] || 0 }));
  const tot = (o) => Object.values(o).reduce((s, v) => s + v, 0);
  const exportCsv = () => { const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [['date', 'description', 'amount', 'type', 'category', 'account', 'source'], ...f.data.transactions.map((t) => [t.date, t.note, t.amount, t.type, t.category, f.data.accounts.find((a) => a.id === t.accountId)?.name, t.source])];
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv' })); a.download = 'monetra-transactions.csv'; a.click(); };
  return (<><PageHeader title="Reports & Insights" sub={`${f.month} compared with ${pm}`}><button className="btn" onClick={exportCsv}><Download size={16} /> Export CSV</button></PageHeader>
    <div className="grid kpis"><StatCard label="This month" value={inr(tot(cur))} /><StatCard label="Last month" value={inr(tot(prev))} /><StatCard label="Change" value={tot(prev) ? `${((tot(cur) / tot(prev) - 1) * 100).toFixed(0)}%` : 'n/a'} /></div>
    <ChartCard title="Category comparison"><div className="chart tall"><ResponsiveContainer><BarChart data={data}><XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} /><YAxis width={44} tickFormatter={(v) => `${v / 1000}k`} tickLine={false} axisLine={false} /><Tooltip formatter={(v) => inr(v)} /><Legend verticalAlign="top" />
      <Bar dataKey={pm} fill="#CDB58E" radius={[4, 4, 0, 0]} /><Bar dataKey={f.month} fill="#111B2F" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartCard></>);
}
