export default function ChartCard({ title, action, children, className = '' }) {
  return <section className={`card ${className}`}><div className="card-head"><h3>{title}</h3>{action}</div>{children}</section>;
}
export const PageHeader = ({ title, sub, children }) => (
  <div className="page-head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div><div className="page-actions">{children}</div></div>
);
export const PALETTE = ['#111B2F', '#CDB58E', '#603A2A', '#8E887F', '#2A1B15', '#A58F69', '#3C4A66'];
