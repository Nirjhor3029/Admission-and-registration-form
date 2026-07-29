export default function Select({ label, icon, error, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-label-md text-on-surface font-semibold">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            {icon}
          </span>
        )}
        <select
          className={`h-12 w-full rounded-lg border ${error ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest px-4 ${icon ? 'pl-10' : ''} text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
          expand_more
        </span>
      </div>
      {error && <span className="text-body-sm text-error">{error}</span>}
    </div>
  );
}
