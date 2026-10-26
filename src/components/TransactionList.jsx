import { Pencil, Trash2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { inr } from './StatCard';

const sign = (t) => (t.type === 'income' || t.type === 'refund' ? 1 : t.type === 'expense' ? -1 : 0);
export default function TransactionList({ items, compact }) {
  const f = useFinance();
  const name = (id) => f.data.accounts.find((a) => a.id === id)?.name || '—';
  if (!items.length) return <p className="empty">No transactions match. Add one with the + button.</p>;
  return (
    <div className="txn-table">
      {items.map((t) => (
        <div className="txn" key={t.id}>
          <div className="txn-main"><b>{t.note || t.category}</b><small>{t.date} · {t.category}</small></div>
          {!compact && <div className="txn-meta"><span className="pill">{t.type}</span><small>{name(t.accountId)}{t.toAccountId ? ` → ${name(t.toAccountId)}` : ''} · {t.source}</small></div>}
          <div className={`txn-amt ${sign(t) > 0 ? 'pos' : ''}`}>{sign(t) > 0 ? '+' : sign(t) < 0 ? '−' : ''}{inr(t.amount).replace('−', '')}</div>
          {!compact && <div className="txn-act"><button className="icon-btn" aria-label="Edit" onClick={() => f.setModal({ txn: t })}><Pencil size={15} /></button>
            <button className="icon-btn" aria-label="Delete" onClick={() => window.confirm('Delete this transaction?') && f.deleteTxn(t.id)}><Trash2 size={15} /></button></div>}
        </div>
      ))}
    </div>
  );
}
