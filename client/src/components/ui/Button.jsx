export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'h-12 rounded-lg font-label-md flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed px-6';
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container hover:opacity-90',
    outline: 'border-2 border-outline text-on-surface hover:border-primary hover:text-primary',
    ghost: 'text-on-surface hover:bg-surface-variant',
    danger: 'border-2 border-error text-error hover:bg-error-container/20',
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
