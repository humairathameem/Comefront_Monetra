import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

export default function MySalary() {
  const f = useFinance(); const [n, setN] = useState({ name: '', amount: '' });
  const total = f.data.incomes.reduce((s, i) => s + i.amount, 0);
  const upd = (id, k, v) => f.patch('incomes', (l) => l.map((i) => (i.id === id ? { ...i, [k]: k === 'amount' || k === 'payday' ? Math.max(0, +v || 0) : v } : i)));
  const credit = (i) => f.saveTxn({ date: f.today, type: 'income', amount: i.amount, category: 'Salary', accountId: 'acc1', note: `${i.name} credit`, source: 'Salary record' });
  return (<>
    <PageHeader title="My Salary" sub="Income sources feed your monthly flexible budget." />
    <div className="grid kpis"><StatCard label="Expected monthly income" value={inr(total)} /><StatCard label="Received this month" value={inr(f.budget.income)} /><StatCard label="Payday" value={`Day ${f.data.settings.payday}`} /></div>
    <ChartCard title="Income sources">
      {f.data.incomes.map((i) => <div className="edit-row" key={i.id}>
        <input value={i.name} onChange={(e) => upd(i.id, 'name', e.target.value)} aria-label="Source" />
        <input type="number" value={i.amount} onChange={(e) => upd(i.id, 'amount', e.target.value)} aria-label="Amount" />
        <input type="number" min="1" max="31" value={i.payday} onChange={(e) => upd(i.id, 'payday', e.target.value)} aria-label="Payday" />
        <button className="btn" onClick={() => credit(i)}>Record credit</button>
        <button className="btn ghost" onClick={() => f.patch('incomes', (l) => l.filter((x) => x.id !== i.id))}>Remove</button></div>)}
      <div className="edit-row"><input placeholder="New source" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /><input type="number" placeholder="Amount" value={n.amount} onChange={(e) => setN({ ...n, amount: e.target.value })} />
        <button className="btn primary" onClick={() => n.name && +n.amount > 0 && (f.patch('incomes', (l) => [...l, { id: `i${Date.now()}`, name: n.name, amount: +n.amount, cycle: 'Monthly', payday: 1 }]), setN({ name: '', amount: '' }))}>Add source</button></div>
    </ChartCard></>);
}
