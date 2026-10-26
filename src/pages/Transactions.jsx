import { useMemo, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CATEGORIES } from '../engine/budgetEngine';
import ChartCard, { PageHeader } from '../components/ChartCard';
import TransactionList from '../components/TransactionList';

const TYPES = ['income', 'expense', 'withdrawal', 'refund', 'transfer'];
const key = (t) => `${t.date}|${t.amount}|${t.type}|${(t.note || '').toLowerCase()}|${t.accountId}`;
/** Parse CSV: date,description,amount,type,category,account. Returns valid rows and per-line errors. */
export function parseCsv(text, accounts) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean); const rows = [], errors = [];
  lines.slice(/date/i.test(lines[0]) ? 1 : 0).forEach((ln, i) => {
    const [date, note, amt, type = 'expense', category = 'Other', acc] = ln.split(',').map((s) => s.trim());
    const amount = Math.round(Number(amt)), n = i + 2;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return errors.push(`Line ${n}: date must be YYYY-MM-DD`);
    if (!(amount > 0)) return errors.push(`Line ${n}: amount must be positive`);
    if (!TYPES.includes(type) || ['withdrawal', 'transfer'].includes(type)) return errors.push(`Line ${n}: type must be income, expense or refund`);
    if (!(category in CATEGORIES)) return errors.push(`Line ${n}: unknown category "${category}"`);
    const account = accounts.find((a) => a.name.toLowerCase() === (acc || '').toLowerCase()) || accounts[0];
    rows.push({ date, note, amount, type, category, accountId: account.id, source: 'CSV import' });
  });
  return { rows, errors };
}

export default function Transactions() {
  const f = useFinance(); const fileRef = useRef(); const [q, setQ] = useState({ type: 'all', cat: 'all', from: '', to: '' }); const [msg, setMsg] = useState('');
  const items = useMemo(() => f.data.transactions.filter((t) => (!f.accountIds || f.accountIds.includes(t.accountId) || f.accountIds.includes(t.toAccountId))
    && (q.type === 'all' || t.type === q.type) && (q.cat === 'all' || t.category === q.cat) && (!q.from || t.date >= q.from) && (!q.to || t.date <= q.to)
    && (!f.search || `${t.note} ${t.category}`.toLowerCase().includes(f.search.toLowerCase()))).sort((a, b) => b.date.localeCompare(a.date)), [f.data, f.accountIds, q, f.search]);
  const onFile = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const { rows, errors } = parseCsv(await file.text(), f.data.accounts);
    const seen = new Set(f.data.transactions.map(key)); let dup = 0; const fresh = [];
    rows.forEach((r) => { if (seen.has(key(r))) dup++; else { seen.add(key(r)); fresh.push({ ...r, id: `t${Date.now()}${fresh.length}` }); } });
    f.patch('transactions', (l) => [...l, ...fresh]);
    f.patch('imports', (l) => [{ file: file.name, date: f.today, added: fresh.length, duplicates: dup, errors: errors.length }, ...l]);
    setMsg(`${fresh.length} imported, ${dup} duplicate(s) skipped${errors.length ? `, ${errors.length} invalid: ${errors.slice(0, 3).join('; ')}` : ''}.`); e.target.value = '';
  };
  return (<><PageHeader title="Transactions" sub="Every entry shows its account and source."><button className="btn" onClick={() => fileRef.current.click()}><Upload size={16} /> Import CSV</button><input ref={fileRef} type="file" accept=".csv" hidden onChange={onFile} /></PageHeader>
    {msg && <div className="alert info">{msg}</div>}
    <ChartCard title={`${items.length} transactions`}>
      <div className="filters">
        <select value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })}><option value="all">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        <select value={q.cat} onChange={(e) => setQ({ ...q, cat: e.target.value })}><option value="all">All categories</option>{Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}</select>
        <input type="date" value={q.from} onChange={(e) => setQ({ ...q, from: e.target.value })} aria-label="From" /><input type="date" value={q.to} onChange={(e) => setQ({ ...q, to: e.target.value })} aria-label="To" /></div>
      <TransactionList items={items} /></ChartCard>
    <p className="muted">CSV columns: date (YYYY-MM-DD), description, amount, type, category, account</p></>);
}
