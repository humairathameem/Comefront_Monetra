export const inr = (n) => `${n < 0 ? '−' : ''}₹${Math.abs(Math.round(n)).toLocaleString('en-IN')}`;
export default function StatCard({ label, value, hint, tone, icon: Icon, big }) {
  return (
    <div className={`card stat ${tone || ''} ${big ? 'big' : ''}`}>
      <div className="stat-top"><span>{label}</span>{Icon && <Icon size={16} />}</div>
      <strong>{value}</strong>{hint && <small>{hint}</small>}
    </div>
  );
}
