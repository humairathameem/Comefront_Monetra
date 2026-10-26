import { useFinance } from '../context/FinanceContext';
import ChartCard, { PageHeader } from '../components/ChartCard';

export default function Settings() {
  const f = useFinance(); const s = f.data.settings;
  return (<><PageHeader title="Settings" sub="Prototype preferences stored in this browser only." />
    <ChartCard title="Profile & preferences"><div className="form"><label>Name<input value={s.name} onChange={(e) => f.setSettings({ name: e.target.value })} /></label>
      <label>Payday (day of month)<input type="number" min="1" max="31" value={s.payday} onChange={(e) => f.setSettings({ payday: Math.min(31, Math.max(1, +e.target.value || 1)) })} /></label><label>Currency<input value="INR (₹)" disabled /></label></div></ChartCard>
    <ChartCard title="Privacy & session"><p>Demo authentication only: there is no real login. A production version needs a backend with secure, server-side sessions.</p>
      <div className="edit-row"><button className="btn" onClick={() => window.confirm('Reset all data to the demo set?') && f.resetDemo()}>Reset demo data</button></div></ChartCard></>);
}
