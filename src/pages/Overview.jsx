import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, PiggyBank, CalendarClock, Banknote, TrendingDown, TrendingUp } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { coachInsights, CATEGORIES, daysInMonth } from '../engine/budgetEngine';
import StatCard, { inr } from '../components/StatCard';
import ChartCard, { PageHeader, PALETTE } from '../components/ChartCard';
import TransactionList from '../components/TransactionList';

export function weeklySpend(txns, month, ids) {
  const w = [0, 0, 0, 0, 0];
  txns.filter((t) => t.type === 'expense' && t.date.startsWith(month) && (!ids || ids.includes(t.accountId))).forEach((t) => { w[Math.min(4, Math.floor((+t.date.slice(8, 10) - 1) / 7))] += t.amount; });
  return w.map((v, i) => ({ name: `Wk ${i + 1}`, spend: v }));
}

export default function Overview() {
  const f = useFinance(); const b = f.budget;
  const cash = b.balances.acc3 ?? 0;
  const cashShown = f.accountIds && !f.accountIds.includes('acc3') ? 0 : cash;
  const donut = Object.entries(f.spend).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  const alloc = { Needs: 0, Wants: 0, Savings: b.savedIn, Investments: 0 };
  Object.entries(f.spend).forEach(([c, v]) => { const k = CATEGORIES[c]; if (k === 'needs') alloc.Needs += v; if (k === 'wants') alloc.Wants += v; if (k === 'investments') alloc.Investments += v; });
  const allocTotal = Object.values(alloc).reduce((s, v) => s + v, 0) || 1;
  const recent = [...f.data.transactions].filter((t) => t.date.startsWith(f.month) && (!f.accountIds || f.accountIds.includes(t.accountId))).sort((a, c) => c.date.localeCompare(a.date)).slice(0, 5);
  const insight = coachInsights({ txns: f.data.transactions, budget: b, month: f.month, today: f.today, budgets: f.data.settings.budgets })[0];
  const healthText = { good: 'Healthy', watch: 'Watch spending', over: 'Over budget' }[b.health];
  return (
    <>
      <PageHeader title="Overview" sub="Demo data — figures update live from your transactions." />
      <div className="hero card">
        <div><span className="eyebrow-less">Safe to spend today</span><div className="hero-num">{inr(b.daily)}</div>
          <p>{inr(b.safeToSpend)} left across {b.daysLeft} days after protecting {inr(b.protectedRemaining)} for savings and reserving {inr(b.reserved)} for bills.</p></div>
        <div className={`health ${b.health}`}><b>{healthText}</b><small>Budget health</small></div>
      </div>
      {b.negativeAccounts.length > 0 && <div className="alert bad">Negative balance in {b.negativeAccounts.map((a) => a.name).join(', ')}. Protected money in other accounts is not used to cover it.</div>}
      <div className="grid kpis">
        <StatCard label="Total tracked balance" value={inr(b.total)} icon={Wallet} />
        <StatCard label="Monthly income" value={inr(b.income)} icon={TrendingUp} />
        <StatCard label="Monthly spending" value={inr(b.expenses)} icon={TrendingDown} />
        <StatCard label="Protected savings" value={inr(b.protectedTarget)} hint={`${inr(b.protectedRemaining)} still to move`} icon={PiggyBank} />
        <StatCard label="Reserved for bills" value={inr(b.reserved)} hint={`${b.unpaid.length} unpaid`} icon={CalendarClock} />
        <StatCard label="Cash in hand" value={inr(cashShown)} icon={Banknote} />
      </div>
      <div className="grid two">
        <ChartCard title="Weekly spending"><div className="chart"><ResponsiveContainer><BarChart data={weeklySpend(f.data.transactions, f.month, f.accountIds)}>
          <XAxis dataKey="name" tickLine={false} axisLine={false} /><YAxis width={44} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
          <Tooltip formatter={(v) => inr(v)} /><Bar dataKey="spend" fill="#111B2F" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></ChartCard>
        <ChartCard title="Spending by category"><div className="chart"><ResponsiveContainer><PieChart>
          <Pie data={donut} dataKey="value" innerRadius="55%" outerRadius="85%" paddingAngle={2}>{donut.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}</Pie>
          <Tooltip formatter={(v) => inr(v)} /></PieChart></ResponsiveContainer></div>
          <div className="legend">{donut.map((d, i) => <span key={d.name}><i style={{ background: PALETTE[i % PALETTE.length] }} />{d.name}</span>)}</div></ChartCard>
      </div>
      <div className="grid two">
        <ChartCard title="Allocation" action={<small className="muted">Needs · Wants · Savings · Investments</small>}>
          {Object.entries(alloc).map(([k, v]) => <div className="bar-row" key={k}><span>{k}</span><div className="track"><div style={{ width: `${(v / allocTotal) * 100}%` }} /></div><b>{inr(v)}</b></div>)}</ChartCard>
        <ChartCard title="Upcoming bills" action={<Link to="/bills">Manage</Link>}>
          {b.unpaid.length ? b.unpaid.sort((a, c) => a.due - c.due).map((x) => <div className="row" key={x.id}><span>{x.name}<small> due {x.due}{['st','nd','rd'][x.due-1]||'th'}</small></span><b>{inr(x.amount)}</b></div>) : <p className="empty">All bills for {f.month} are paid.</p>}</ChartCard>
      </div>
      <div className="grid two">
        <ChartCard title="Recent transactions" action={<Link to="/transactions">View all</Link>}><TransactionList items={recent} compact /></ChartCard>
        <ChartCard title="Money Coach" action={<Link to="/coach">More</Link>}><div className={`insight ${insight.level}`}><b>{insight.title}</b><p>{insight.body}</p></div></ChartCard>
      </div>
    </>
  );
}
void daysInMonth;
