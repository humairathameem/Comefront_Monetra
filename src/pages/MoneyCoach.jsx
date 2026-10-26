import { useFinance } from '../context/FinanceContext';
import { coachInsights } from '../engine/budgetEngine';
import ChartCard, { PageHeader } from '../components/ChartCard';

export default function MoneyCoach() {
  const f = useFinance();
  const list = coachInsights({ txns: f.data.transactions, budget: f.budget, month: f.month, today: f.today, budgets: f.data.settings.budgets });
  return (<><PageHeader title="AI Money Coach" sub="Rule-based insights computed from your own data. No external AI or keys needed." />
    {list.map((i, k) => <div key={k} className={`card insight ${i.level}`}><b>{i.title}</b><p>{i.body}</p></div>)}
    <ChartCard title="How insights work"><small>Each insight is a deterministic rule: week-over-week spend, category budget usage of 85% or more, reserved bills, and protected savings still due.</small></ChartCard></>);
}
