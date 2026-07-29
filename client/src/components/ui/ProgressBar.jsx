export default function ProgressBar({ value, max = 100, className = '' }) {
  const pct = Math.min((value / max) * 100, 100);
  const color = pct >= 100 ? 'bg-error' : pct >= 80 ? 'bg-secondary-container' : 'bg-primary';
  return (
    <div className={`h-2 rounded-full bg-outline-variant/30 overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
