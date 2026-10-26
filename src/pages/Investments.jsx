import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useFinance } from '../context/FinanceContext';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader, PALETTE } from '../components/ChartCard';

export default function Investments() {
  const f = useFinance(); const list = f.data.investments; const [n, setN] = useState({ name: '', kind: 'Equity', invested: '', current: '' });
  const inv = list.reduce((s, i) => s + i.invested, 0), cur = list.reduce((s, i) => s + i.current, 0);
  const byKind = Object.entries(list.reduce((o, i) => ({ ...o, [i.kind]: (o[i.kind] || 0) + i.current }), {})).map(([name, value]) => ({ name, value }));
  const upd = (id, v) => f.patch('investments', (l) => l.map((i) => (i.id === id ? { ...i, current: Math.max(0, +v || 0) } : i)));
  return (<><PageHeader title="Investments" sub="Manually tracked. Values are entered by you — no live market data and no trading." />
    <div className="grid kpis"><StatCard label="Invested" value={inr(inv)} /><StatCard label="Current value" value={inr(cur)} /><StatCard label="Gain" value={`${inr(cur - inv)} (${inv ? ((cur / inv - 1) * 100).toFixed(1) : 0}%)`} /></div>
    <div className="grid two"><ChartCard title="Holdings">{list.map((i) => <div className="row" key={i.id}><span>{i.name}<small> {i.kind} · invested {inr(i.invested)}</small></span><input className="mini" type="number" value={i.current} onChange={(e) => upd(i.id, e.target.value)} aria-label="Current value" /></div>)}
      <div className="edit-row"><input placeholder="Name" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /><select value={n.kind} onChange={(e) => setN({ ...n, kind: e.target.value })}><option>Equity</option><option>Debt</option><option>Gold</option></select>
        <input type="number" placeholder="Invested ₹" value={n.invested} onChange={(e) => setN({ ...n, invested: e.target.value, current: e.target.value })} />
        <button className="btn primary" onClick={() => n.name && +n.invested > 0 && (f.patch('investments', (l) => [...l, { id: `v${Date.now()}`, name: n.name, kind: n.kind, invested: +n.invested, current: +n.current }]), setN({ name: '', kind: 'Equity', invested: '', current: '' }))}>Add</button></div></ChartCard>
      <ChartCard title="Portfolio allocation"><div className="chart"><ResponsiveContainer><PieChart><Pie data={byKind} dataKey="value" innerRadius="55%" outerRadius="85%">{byKind.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}</Pie><Tooltip formatter={(v) => inr(v)} /></PieChart></ResponsiveContainer></div>
        <div className="legend">{byKind.map((d, i) => <span key={d.name}><i style={{ background: PALETTE[i] }} />{d.name}</span>)}</div></ChartCard></div></>);
}
