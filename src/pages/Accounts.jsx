import { useFinance } from '../context/FinanceContext';
import { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

// Adapter interface for future authorised providers (e.g. Account Aggregator). Prototype only simulates.
export const providerAdapter = { name: 'Simulated feed', connect: async () => { throw new Error('No live provider connected in this prototype'); }, fetchTransactions: async () => [] };
export default function Accounts() {
  const f = useFinance();
  return (<><PageHeader title="Accounts & Connections" sub="All connections are simulated. Monetra never asks for bank passwords or UPI PINs." />
    <div className="grid two">{f.data.accounts.map((a) => <div key={a.id} className={`card acct ${f.accountId === a.id ? 'sel' : ''}`}><b>{a.name}</b><small>{a.type} · {a.status}</small><strong>{inr(f.budget.balances[a.id])}</strong>
      <button className="btn" onClick={() => f.setAccountId(a.id)}>View only this account</button></div>)}
      <div className={`card acct ${f.accountId === 'all' ? 'sel' : ''}`}><b>Combined</b><small>Transfers are not double counted</small><strong>{inr(Object.values(f.budget.balances).reduce((s, v) => s + v, 0))}</strong><button className="btn" onClick={() => f.setAccountId('all')}>View combined</button></div></div>
    <ChartCard title="CSV import history">{f.data.imports.length ? f.data.imports.map((i, k) => <div className="row" key={k}><span>{i.file}<small> {i.date}</small></span><span>{i.added} added · {i.duplicates} duplicates · {i.errors} invalid</span></div>) : <p className="empty">No imports yet. Use Transactions → Import CSV.</p>}</ChartCard></>);
}
