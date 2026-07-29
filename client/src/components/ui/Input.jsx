import { forwardRef } from 'react';

const Input = forwardRef(({ label, icon, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-label-md text-on-surface font-semibold">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={`h-12 w-full rounded-lg border ${error ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest px-4 ${icon ? 'pl-10' : ''} text-body-md text-on-surface placeholder:text-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-body-sm text-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
