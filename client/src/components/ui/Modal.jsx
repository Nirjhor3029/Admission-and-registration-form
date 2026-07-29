export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-xl shadow-xl max-w-lg w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md font-semibold">{title}</h2>
          <button onClick={onClose} className="material-symbols-outlined text-outline hover:text-on-surface cursor-pointer">close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
