import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { billPaid } from '../engine/budgetEngine';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

export default function Bills() {
  const f = useFinance(); const [n, setN] = useState({ name: '', amount: '', due: '' }); const day = +f.today.slice(8, 10);
  const pay = (b) => f.saveTxn({ date: f.today, type: 'expense', amount: b.amount, category: 'Bills', accountId: 'acc1', note: b.name, billId: b.id, source: 'Bill payment' });
  return (<><PageHeader title="Bills & Commitments" sub="Unpaid bills are reserved and never counted as spendable." />
    <div className="grid kpis"><StatCard label="Total commitments" value={inr(f.budget.monthBills)} /><StatCard label="Reserved (unpaid)" value={inr(f.budget.reserved)} /><StatCard label="Unpaid bills" value={f.budget.unpaid.length} /></div>
    <ChartCard title="This month">{[...f.data.bills].sort((a, b) => a.due - b.due).map((b) => { const paid = billPaid(b, f.data.transactions, f.month); const soon = !paid && b.due >= day && b.due - day <= 5; const late = !paid && b.due < day; return (
      <div className="row bill" key={b.id}><span>{b.name}<small> due day {b.due}</small></span><span className={`pill ${paid ? 'ok' : late ? 'bad' : soon ? 'warn' : ''}`}>{paid ? 'Paid' : late ? 'Overdue' : soon ? 'Due soon' : 'Upcoming'}</span><b>{inr(b.amount)}</b>
        {!paid && <button className="btn" onClick={() => pay(b)}>Mark paid</button>}<button className="btn ghost" onClick={() => f.patch('bills', (l) => l.filter((x) => x.id !== b.id))}>Remove</button></div>); })}
      <div className="edit-row"><input placeholder="Bill name" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /><input type="number" placeholder="Amount" value={n.amount} onChange={(e) => setN({ ...n, amount: e.target.value })} /><input type="number" min="1" max="31" placeholder="Due day" value={n.due} onChange={(e) => setN({ ...n, due: e.target.value })} />
        <button className="btn primary" onClick={() => n.name && +n.amount > 0 && +n.due >= 1 && +n.due <= 31 && (f.patch('bills', (l) => [...l, { id: `b${Date.now()}`, name: n.name, amount: +n.amount, due: +n.due }]), setN({ name: '', amount: '', due: '' }))}>Add bill</button></div></ChartCard></>);
}
