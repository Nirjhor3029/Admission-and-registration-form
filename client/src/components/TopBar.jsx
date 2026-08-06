export default function TopBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-16 bg-surface shadow-sm">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">school</span>
        <div className="flex flex-col justify-center leading-none">
          <span className="text-headline-md font-bold text-primary">SARS</span>
          <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-on-surface-variant mt-0.5">Online Admission &amp; Registration System</span>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex items-center justify-center">
        <span className="material-symbols-outlined text-outline text-[20px]">person</span>
      </div>
    </header>
  );
}
