export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
