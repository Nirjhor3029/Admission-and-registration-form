import { useState, useEffect } from 'react';

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Delete',
  danger = true,
  confirmText,
  loading = false,
  onConfirm,
  icon = 'delete',
}) {
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (open) setTyped('');
  }, [open]);

  if (!open) return null;

  const requiresConfirm = Boolean(confirmText);
  const canConfirm = !requiresConfirm || typed === confirmText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="animate-fade-in-up bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`h-1.5 w-full ${danger ? 'bg-error' : 'bg-primary'}`} />

        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${danger ? 'bg-error-container/40 text-error' : 'bg-primary-container/40 text-primary'}`}>
            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          </div>

          <div>
            <h3 className="text-headline-md text-on-surface">{title}</h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">{description}</p>
          </div>

          {requiresConfirm && (
            <div className="w-full text-left">
              <label className="text-label-sm text-on-surface-variant mb-1 block">
                Type <strong className="text-error">{confirmText}</strong> to confirm
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={confirmText}
                autoFocus
                className="w-full h-11 px-3 border border-outline-variant rounded-lg text-body-md focus:border-error focus:ring-1 focus:ring-error outline-none bg-surface-container-lowest"
              />
            </div>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-lg bg-surface border border-outline-variant text-on-surface text-label-md hover:bg-surface-variant transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!canConfirm || loading}
              className={`flex-1 h-11 rounded-lg text-on-error text-label-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${danger ? 'bg-error hover:bg-error/90' : 'bg-primary hover:bg-primary/90'}`}
            >
              {loading && <span className="w-4 h-4 border-2 border-on-error border-t-transparent rounded-full animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
