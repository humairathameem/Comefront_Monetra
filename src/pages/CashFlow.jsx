import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';
import TransactionList from '../components/TransactionList';

export default function CashFlow() {
  const f = useFinance(); const bal = f.budget.balances; const [actual, setActual] = useState('');
  const cashIds = f.data.accounts.filter((a) => a.type === 'cash').map((a) => a.id); const cash = cashIds.reduce((s, id) => s + bal[id], 0);
  const digital = f.data.accounts.filter((a) => a.type !== 'cash').reduce((s, a) => s + bal[a.id], 0);
  const items = f.data.transactions.filter((t) => cashIds.includes(t.accountId) || cashIds.includes(t.toAccountId)).sort((a, b) => b.date.localeCompare(a.date));
  const reconcile = () => { const diff = Math.round(+actual) - cash; if (actual === '' || diff === 0) return;
    f.saveTxn({ date: f.today, type: diff > 0 ? 'income' : 'expense', amount: Math.abs(diff), category: diff > 0 ? 'Salary' : 'Other', accountId: cashIds[0], note: `Cash reconciliation (${diff > 0 ? '+' : ''}${diff})`, source: 'Reconciliation' }); setActual(''); };
  return (<><PageHeader title="CashFlow" sub="ATM withdrawals move money to cash; only cash purchases count as spending." />
    <div className="grid kpis"><StatCard label="Physical cash" value={inr(cash)} /><StatCard label="Digital balance" value={inr(digital)} /><StatCard label="Withdrawn this month" value={inr(f.data.transactions.filter((t) => t.type === 'withdrawal' && t.date.startsWith(f.month)).reduce((s, t) => s + t.amount, 0))} /></div>
    <ChartCard title="Reconcile cash"><div className="edit-row"><input type="number" placeholder="Cash you actually have (₹)" value={actual} onChange={(e) => setActual(e.target.value)} /><button className="btn primary" onClick={reconcile}>Correct balance</button></div>
      <small className="muted">Estimated cash is {inr(cash)}. Corrections are logged as a transaction so the history stays honest.</small></ChartCard>
    <ChartCard title="Cash activity"><TransactionList items={items} /></ChartCard></>);
}
