import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../engine/budgetEngine';

const TYPES = ['expense', 'income', 'refund', 'withdrawal', 'transfer'];
export default function QuickAddModal() {
  const f = useFinance();
  const blank = { type: 'expense', amount: '', category: 'Groceries', accountId: f.data.accounts[0].id, toAccountId: '', date: f.today, note: '' };
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState('');
  useEffect(() => { if (f.modal) { setForm(f.modal.txn ? { ...blank, ...f.modal.txn } : blank); setErr(''); } }, [f.modal]); // eslint-disable-line
  if (!f.modal) return null;
  const set = (k, v) => setForm((x) => ({ ...x, [k]: v }));
  const moves = form.type === 'withdrawal' || form.type === 'transfer';
  const submit = (e) => {
    e.preventDefault();
    const amount = Math.round(Number(form.amount));
    if (!(amount > 0)) return setErr('Enter an amount greater than zero.');
    if (!form.date) return setErr('Choose a date.');
    if (moves && (!form.toAccountId || form.toAccountId === form.accountId)) return setErr('Choose a different destination account.');
    const category = form.type === 'withdrawal' ? 'Cash' : form.type === 'transfer' ? 'Savings' : form.type === 'income' ? 'Salary' : form.category;
    f.saveTxn({ ...form, amount, category, toAccountId: moves ? form.toAccountId : undefined, source: form.source || 'Manual entry' });
    f.setModal(null);
  };
  const exp = Object.keys(CATEGORIES).filter((c) => !['Salary', 'Cash', 'Savings'].includes(c));
  return (
    <div className="modal-wrap" onClick={() => f.setModal(null)}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className="card-head"><h3>{form.id ? 'Edit transaction' : 'Add transaction'}</h3><button type="button" className="icon-btn" onClick={() => f.setModal(null)} aria-label="Close"><X size={18} /></button></div>
        <div className="seg">{TYPES.map((t) => <button type="button" key={t} className={form.type === t ? 'on' : ''} onClick={() => set('type', t)}>{t}</button>)}</div>
        <label>Amount (₹)<input inputMode="numeric" type="number" min="1" value={form.amount} onChange={(e) => set('amount', e.target.value)} autoFocus /></label>
        {(form.type === 'expense' || form.type === 'refund') && <label>Category<select value={form.category} onChange={(e) => set('category', e.target.value)}>{exp.map((c) => <option key={c}>{c}</option>)}</select></label>}
        <label>{moves ? 'From account' : 'Account'}<select value={form.accountId} onChange={(e) => set('accountId', e.target.value)}>{f.data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        {moves && <label>To account<select value={form.toAccountId} onChange={(e) => set('toAccountId', e.target.value)}><option value="">Select…</option>{f.data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>}
        <label>Date<input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} /></label>
        <label>Note<input value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Optional" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn primary wide" type="submit">Save transaction</button>
      </form>
    </div>
  );
}
