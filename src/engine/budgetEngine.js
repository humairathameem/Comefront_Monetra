// Monetra budget engine — pure functions, no UI. All money in whole rupees.
// Transaction types: income | expense | refund | withdrawal | transfer.
//  - withdrawal/transfer move money between OWNED accounts (accountId -> toAccountId): never income or spending.
//  - refund reduces spending in its category.
export const CATEGORIES = {
  Rent: 'needs', Groceries: 'needs', Utilities: 'needs', Transport: 'needs', Health: 'needs', Bills: 'needs',
  Shopping: 'wants', Dining: 'wants', Entertainment: 'wants', Travel: 'wants', Other: 'wants',
  Investments: 'investments', Savings: 'savings', Salary: 'income', Cash: 'transfer',
};
export const monthOf = (d) => String(d).slice(0, 7);
export const daysInMonth = (m) => new Date(+m.slice(0, 4), +m.slice(5, 7), 0).getDate();
export const todayStr = () => new Date().toISOString().slice(0, 10);

const inScope = (t, ids) => !ids || ids.includes(t.accountId) || (t.toAccountId && ids.includes(t.toAccountId));
const isProtectedCat = (c) => ['investments', 'savings'].includes(CATEGORIES[c]);

/** Balance per account. Transfers net to zero in the combined view, so nothing is double counted. */
export function balances(accounts, txns) {
  const b = Object.fromEntries(accounts.map((a) => [a.id, a.opening]));
  for (const t of txns) {
    if (!(t.accountId in b)) continue;
    if (t.type === 'income' || t.type === 'refund') b[t.accountId] += t.amount;
    else if (t.type === 'expense') b[t.accountId] -= t.amount;
    else if ((t.type === 'withdrawal' || t.type === 'transfer') && t.toAccountId in b) { b[t.accountId] -= t.amount; b[t.toAccountId] += t.amount; }
  }
  return b;
}

export const billPaid = (bill, txns, month) => txns.some((t) => t.billId === bill.id && monthOf(t.date) === month);

/** Core calculation. extraExpense lets the Time Machine simulate without touching real data. */
export function computeBudget({ accounts, txns, bills, goals, month, today = todayStr(), accountIds = null, extraExpense = 0 }) {
  const scopeAcc = accounts.filter((a) => !accountIds || accountIds.includes(a.id));
  const bal = balances(accounts, txns);
  const mt = txns.filter((t) => monthOf(t.date) === month && inScope(t, accountIds));
  const sum = (f) => mt.filter(f).reduce((s, t) => s + t.amount, 0);
  const income = sum((t) => t.type === 'income');
  const expenses = sum((t) => t.type === 'expense') - sum((t) => t.type === 'refund');
  // Flexible spending excludes bills (reserved separately) and investment/savings contributions (protected).
  const flexSpent = sum((t) => t.type === 'expense' && !t.billId && !isProtectedCat(t.category))
    - sum((t) => t.type === 'refund' && !isProtectedCat(t.category)) + extraExpense;
  const savedIn = mt.filter((t) => t.type === 'transfer' && accounts.find((a) => a.id === t.toAccountId)?.type === 'savings').reduce((s, t) => s + t.amount, 0)
    + sum((t) => t.type === 'expense' && CATEGORIES[t.category] === 'investments');

  const protectedTarget = goals.reduce((s, g) => s + (+g.monthly || 0), 0);
  const protectedRemaining = Math.max(0, protectedTarget - savedIn);
  const monthBills = bills.reduce((s, b) => s + b.amount, 0);
  const unpaid = bills.filter((b) => !billPaid(b, txns, month));
  const reserved = unpaid.reduce((s, b) => s + b.amount, 0);

  // Flexible budget = income − protected savings − reserved commitments (all bills this month).
  const flexible = income - protectedTarget - monthBills;
  const remainingFlex = flexible - flexSpent;

  // Real-money check: liquid (bank + cash) minus protected and reserved money. Savings accounts are NOT spendable,
  // and a negative bank balance is never offset by money held in another account.
  const liquid = scopeAcc.filter((a) => a.type !== 'savings').reduce((s, a) => s + bal[a.id], 0) - extraExpense;
  const negativeAccounts = scopeAcc.filter((a) => a.type !== 'savings' && bal[a.id] < 0);
  const spendable = liquid - protectedRemaining - reserved;
  const safeToSpend = Math.max(0, Math.min(remainingFlex, spendable));

  const dim = daysInMonth(month);
  const cur = monthOf(today) === month ? +today.slice(8, 10) : (month < monthOf(today) ? dim : 1);
  const daysLeft = Math.max(1, dim - cur + 1);
  const savedBalance = scopeAcc.filter((a) => a.type === 'savings').reduce((s, a) => s + bal[a.id], 0);
  return { month, income, expenses, flexSpent, flexible, remainingFlex, protectedTarget, protectedRemaining, savedIn, monthBills, reserved, unpaid,
    liquid, spendable, safeToSpend, daysLeft, daily: Math.round(safeToSpend / daysLeft), total: scopeAcc.reduce((s, a) => s + bal[a.id], 0),
    balances: bal, negativeAccounts, savedBalance, projectedEnd: liquid - reserved,
    health: remainingFlex <= 0 ? 'over' : flexSpent / Math.max(1, flexible) > 0.8 ? 'watch' : 'good' };
}

/** Spending by category for the month (refunds netted off). */
export function categorySpend(txns, month, accountIds = null) {
  const out = {};
  for (const t of txns) {
    if (monthOf(t.date) !== month || !inScope(t, accountIds)) continue;
    if (t.type === 'expense') out[t.category] = (out[t.category] || 0) + t.amount;
    if (t.type === 'refund') out[t.category] = (out[t.category] || 0) - t.amount;
  }
  return out;
}

/** Financial Time Machine: before/after for a hypothetical purchase. Pure — never mutates inputs. */
export function simulatePurchase(ctx, amount) {
  const before = computeBudget(ctx);
  const after = computeBudget({ ...ctx, extraExpense: amount });
  const goalShortfall = Math.max(0, -after.remainingFlex);
  const covered = after.projectedEnd >= 0;
  let verdict = 'safe';
  if (!covered || after.safeToSpend === 0) verdict = 'avoid';
  else if (after.daily < before.daily * 0.6) verdict = 'caution';
  return { before, after, goalShortfall, covered, verdict, dailyDrop: before.daily - after.daily };
}

/** Deterministic, explainable coach rules. */
export function coachInsights({ txns, budget, month, today, budgets }) {
  const out = [];
  const fmt = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;
  const d = (n) => { const x = new Date(today); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  const spendIn = (a, b) => txns.filter((t) => t.type === 'expense' && t.date > d(a) && t.date <= d(b)).reduce((s, t) => s + t.amount, 0);
  const wk = spendIn(7, 0), prev = spendIn(14, 7);
  if (prev > 0 && wk > prev * 1.15) out.push({ level: 'warn', title: 'Spending is up on last week', body: `You spent ${fmt(wk)} in the last 7 days versus ${fmt(prev)} the week before (+${Math.round((wk / prev - 1) * 100)}%).` });
  const cs = categorySpend(txns, month);
  for (const [c, lim] of Object.entries(budgets)) if (lim > 0 && (cs[c] || 0) / lim >= 0.85) {
    const over = (cs[c] || 0) > lim;
    out.push({ level: over ? 'bad' : 'warn', title: `${c} budget ${over ? 'exceeded' : 'nearly used'}`, body: `${fmt(cs[c] || 0)} of ${fmt(lim)} used (${Math.round((cs[c] || 0) / lim * 100)}%).` });
  }
  if (budget.reserved > 0) out.push({ level: 'info', title: 'Bills are held back from your allowance', body: `${fmt(budget.reserved)} across ${budget.unpaid.length} unpaid bill(s) is reserved and not counted as spendable.` });
  if (budget.protectedRemaining > 0) out.push({ level: budget.remainingFlex < 0 ? 'bad' : 'info', title: 'Savings contribution still due', body: `${fmt(budget.protectedRemaining)} still needs to move to your goals this month${budget.remainingFlex < 0 ? ', and overspending puts it at risk' : ''}.` });
  if (!out.length) out.push({ level: 'good', title: 'You are on track', body: 'No budget pressure detected from your recorded transactions.' });
  return out;
}
