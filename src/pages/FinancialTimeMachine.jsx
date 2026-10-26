import { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { simulatePurchase, CATEGORIES } from '../engine/budgetEngine';
import { inr } from '../components/StatCard';
import ChartCard, { PageHeader } from '../components/ChartCard';

export default function FinancialTimeMachine() {
  const f = useFinance(); const [amt, setAmt] = useState(''); const [cat, setCat] = useState('Shopping'); const [done, setDone] = useState(false);
  const amount = Math.round(+amt) || 0;
  const sim = amount > 0 ? simulatePurchase({ ...f.ctx, accountIds: f.accountIds }, amount) : null;
  const rec = { safe: 'Safe to buy. Your daily allowance stays comfortable and bills remain covered.', caution: 'Possible, but it will noticeably shrink your daily allowance. Consider waiting or spreading it out.', avoid: 'Not advised. This would leave bills uncovered or use up your whole allowance.' };
  const rows = sim && [['Daily allowance', inr(sim.before.daily), inr(sim.after.daily)], ['Safe to spend this period', inr(sim.before.safeToSpend), inr(sim.after.safeToSpend)], ['Remaining flexible budget', inr(sim.before.remainingFlex), inr(sim.after.remainingFlex)], ['Projected month-end (after bills)', inr(sim.before.projectedEnd), inr(sim.after.projectedEnd)]];
  const confirm = () => { f.saveTxn({ date: f.today, type: 'expense', amount, category: cat, accountId: f.accountIds?.[0] || 'acc1', note: 'Confirmed from Time Machine', source: 'Time Machine' }); setAmt(''); setDone(true); };
  return (<><PageHeader title="Financial Time Machine" sub="Test a purchase before you make it. Nothing changes until you confirm." />
    <ChartCard title="What if I spend…"><div className="edit-row"><input type="number" inputMode="numeric" placeholder="Amount in ₹" value={amt} onChange={(e) => { setAmt(e.target.value); setDone(false); }} />
      <select value={cat} onChange={(e) => setCat(e.target.value)}>{Object.keys(CATEGORIES).filter((c) => CATEGORIES[c] === 'wants' || CATEGORIES[c] === 'needs').map((c) => <option key={c}>{c}</option>)}</select></div>
      {done && <div className="alert good">Purchase recorded. Your balances are updated.</div>}</ChartCard>
    {sim && <>
      <div className={`card verdict ${sim.verdict}`}><b>{sim.verdict === 'safe' ? 'Looks safe' : sim.verdict === 'caution' ? 'Proceed with care' : 'Better to wait'}</b><p>{rec[sim.verdict]}</p></div>
      <ChartCard title="Before and after"><div className="compare"><span /><b>Now</b><b>After</b>{rows.map(([l, a, b]) => <><span key={l}>{l}</span><span>{a}</span><b>{b}</b></>)}</div></ChartCard>
      <div className="grid two"><ChartCard title="Impact"><p>Bills {sim.covered ? 'stay covered' : 'would NOT be covered'}: {inr(sim.after.reserved)} reserved against {inr(sim.after.liquid)} liquid.</p>
        <p>Savings goals: {sim.goalShortfall > 0 ? `${inr(sim.goalShortfall)} of this month’s protected savings would be at risk.` : 'protected contributions are unaffected.'}</p></ChartCard>
        <ChartCard title="How this was calculated"><small>Remaining flexible budget (income − protected savings − bills − flexible spending so far) is {inr(sim.before.remainingFlex)}. Subtracting {inr(amount)} leaves {inr(sim.after.remainingFlex)}, capped by your real spendable cash ({inr(sim.after.spendable)}), divided over {sim.after.daysLeft} remaining days.</small></ChartCard></div>
      <button className="btn primary wide" onClick={confirm}>Confirm and record purchase</button></>}</>);
}
