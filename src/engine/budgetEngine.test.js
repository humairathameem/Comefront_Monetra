// Run: npm test
import assert from 'node:assert';
import { computeBudget, balances, simulatePurchase } from './budgetEngine.js';
const accounts = [{ id: 'b', type: 'bank', opening: 0 }, { id: 's', type: 'savings', opening: 0 }, { id: 'c', type: 'cash', opening: 0 }];
const tx = [
  { id: 1, date: '2026-10-01', type: 'income', amount: 50000, category: 'Salary', accountId: 'b' },
  { id: 2, date: '2026-10-02', type: 'withdrawal', amount: 2000, category: 'Cash', accountId: 'b', toAccountId: 'c' },
  { id: 3, date: '2026-10-03', type: 'transfer', amount: 5000, category: 'Savings', accountId: 'b', toAccountId: 's' },
];
const ctx = { accounts, txns: tx, bills: [{ id: 'x', amount: 10000 }], goals: [{ monthly: 5000 }], month: '2026-10', today: '2026-10-10' };
const b = balances(accounts, tx);
assert.equal(b.b, 43000); assert.equal(b.c, 2000); assert.equal(b.s, 5000);
assert.equal(Object.values(b).reduce((a, v) => a + v, 0), 50000, 'transfers must not double count');
const r = computeBudget(ctx);
assert.equal(r.expenses, 0, 'withdrawal is not an expense');
assert.equal(r.flexible, 35000); assert.equal(r.protectedRemaining, 0); assert.equal(r.reserved, 10000);
const s = simulatePurchase(ctx, 7000);
assert.ok(s.after.daily < s.before.daily);
assert.equal(computeBudget(ctx).flexSpent, 0, 'simulation must not mutate');
console.log('budgetEngine: all tests passed');
