import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadState, saveState, clearState } from '../utils/storage';
import { computeBudget, categorySpend, todayStr, monthOf } from '../engine/budgetEngine';

const Ctx = createContext(null);
export const useFinance = () => useContext(Ctx);

// Demo data is generated relative to today so every month view is realistic.
function seed() {
  const today = todayStr(), m = monthOf(today), dd = +today.slice(8, 10);
  const day = (n) => `${m}-${String(Math.min(n, dd)).padStart(2, '0')}`;
  let id = 1;
  const t = (d, type, amount, category, accountId, note, extra = {}) => ({ id: `t${id++}`, date: day(d), type, amount, category, accountId, note, source: 'Demo', ...extra });
  return {
    accounts: [
      { id: 'acc1', name: 'Salary Account', type: 'bank', opening: 12000, status: 'Simulated feed' },
      { id: 'acc2', name: 'Savings Vault', type: 'savings', opening: 60000, status: 'Simulated feed' },
      { id: 'acc3', name: 'Cash Wallet', type: 'cash', opening: 800, status: 'Manual' },
    ],
    transactions: [
      t(1, 'income', 85000, 'Salary', 'acc1', 'Monthly salary'),
      t(1, 'expense', 22000, 'Rent', 'acc1', 'Rent', { billId: 'b1' }),
      t(2, 'transfer', 10000, 'Savings', 'acc1', 'Move to savings', { toAccountId: 'acc2' }),
      t(3, 'expense', 3200, 'Groceries', 'acc1', 'Weekly groceries'),
      t(4, 'withdrawal', 3000, 'Cash', 'acc1', 'ATM withdrawal', { toAccountId: 'acc3' }),
      t(5, 'expense', 1800, 'Dining', 'acc1', 'Dinner out'),
      t(6, 'expense', 650, 'Transport', 'acc3', 'Auto & metro', {}),
      t(8, 'expense', 3800, 'Shopping', 'acc1', 'Clothes'),
      t(9, 'expense', 3200, 'Bills', 'acc1', 'Health insurance', { billId: 'b2' }),
      t(11, 'expense', 2600, 'Groceries', 'acc1', 'Groceries'),
      t(12, 'expense', 5000, 'Investments', 'acc1', 'Index fund SIP'),
      t(14, 'expense', 1200, 'Entertainment', 'acc1', 'Movies & OTT'),
      t(16, 'refund', 900, 'Shopping', 'acc1', 'Returned shoes'),
      t(18, 'expense', 2400, 'Dining', 'acc1', 'Weekend brunch'),
      t(20, 'expense', 1500, 'Transport', 'acc1', 'Fuel'),
      t(22, 'expense', 3100, 'Groceries', 'acc1', 'Groceries'),
      t(24, 'expense', 400, 'Dining', 'acc3', 'Street food (cash)'),
      t(25, 'expense', 2900, 'Shopping', 'acc1', 'Home items'),
    ],
    bills: [
      { id: 'b1', name: 'Rent', amount: 22000, due: 1 }, { id: 'b2', name: 'Health insurance', amount: 3200, due: 9 },
      { id: 'b3', name: 'Electricity', amount: 2400, due: 28 }, { id: 'b4', name: 'Broadband', amount: 999, due: 29 },
      { id: 'b5', name: 'Credit card', amount: 8500, due: 30 },
    ],
    goals: [
      { id: 'g1', name: 'Emergency fund', target: 300000, saved: 60000, monthly: 10000 },
      { id: 'g2', name: 'Goa trip', target: 60000, saved: 18000, monthly: 4000 },
    ],
    incomes: [{ id: 'i1', name: 'Salary', amount: 85000, cycle: 'Monthly', payday: 1 }, { id: 'i2', name: 'Freelance (additional)', amount: 12000, cycle: 'Irregular', payday: 15 }],
    investments: [
      { id: 'v1', name: 'Nifty 50 index fund', kind: 'Equity', invested: 60000, current: 66400 },
      { id: 'v2', name: 'PPF', kind: 'Debt', invested: 90000, current: 96300 },
      { id: 'v3', name: 'Digital gold', kind: 'Gold', invested: 20000, current: 21800 },
    ],
    imports: [],
    settings: { name: 'Aarav Mehta', currency: '₹', payday: 1, demo: true, budgets: { Rent: 22000, Groceries: 10000, Utilities: 4000, Transport: 4000, Health: 3000, Shopping: 8000, Dining: 6000, Entertainment: 3000, Travel: 5000 } },
    cashAdjust: [],
  };
}

export function FinanceProvider({ children }) {
  const [data, setData] = useState(() => loadState(seed()));
  const [accountId, setAccountId] = useState('all');
  const [month, setMonth] = useState(monthOf(todayStr()));
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | {txn?}
  const today = todayStr();
  useEffect(() => saveState(data), [data]);

  const accountIds = accountId === 'all' ? null : [accountId];
  const txns = data.transactions;
  const ctx = { accounts: data.accounts, txns, bills: data.bills, goals: data.goals, month, today };
  const budget = useMemo(() => computeBudget({ ...ctx, accountIds }), [data, accountId, month]); // eslint-disable-line
  const spend = useMemo(() => categorySpend(txns, month, accountIds), [data, accountId, month]); // eslint-disable-line

  const patch = (k, fn) => setData((d) => ({ ...d, [k]: fn(d[k]) }));
  const api = {
    data, budget, spend, month, setMonth, accountId, setAccountId, accountIds, search, setSearch, modal, setModal, today, ctx,
    patch, set: (k, v) => setData((d) => ({ ...d, [k]: v })),
    saveTxn: (tx) => patch('transactions', (l) => (tx.id ? l.map((x) => (x.id === tx.id ? tx : x)) : [...l, { ...tx, id: `t${Date.now()}` }])),
    deleteTxn: (id) => patch('transactions', (l) => l.filter((x) => x.id !== id)),
    setSettings: (s) => setData((d) => ({ ...d, settings: { ...d.settings, ...s } })),
    resetDemo: () => { clearState(); setData(seed()); },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
