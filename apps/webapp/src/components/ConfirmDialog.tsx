import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

type ConfirmVariant = 'default' | 'danger';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading: isLoadingProp,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const isLoading = isLoadingProp ?? isLoadingLocal;

  useEffect(() => {
    if (!isOpen) setIsLoadingLocal(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isLoading) return;
    try {
      if (isLoadingProp === undefined) setIsLoadingLocal(true);
      await onConfirm();
    } finally {
      if (isLoadingProp === undefined) setIsLoadingLocal(false);
    }
  };

  const tone =
    variant === 'danger'
      ? {
          iconBg: 'bg-destructive/10',
          icon: 'text-destructive',
          confirm:
            'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive',
        }
      : {
          iconBg: 'bg-primary/10',
          icon: 'text-primary',
          confirm:
            'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary',
        };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl shadow-primary/5 p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tone.iconBg}`}>
              <AlertTriangle className={`w-4 h-4 ${tone.icon}`} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold font-display tracking-tight truncate">{title}</h2>
              {description ? (
                <p className="text-[12px] text-muted-foreground mt-1 leading-snug">{description}</p>
              ) : null}
            </div>
          </div>

          <button
            onClick={isLoading ? undefined : onCancel}
            className="p-2 rounded-xl hover:bg-muted transition-smooth text-muted-foreground disabled:opacity-50"
            type="button"
            disabled={isLoading}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="h-11 px-4 rounded-2xl border border-border bg-card hover:bg-muted transition-smooth font-bold text-sm disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`h-11 px-4 rounded-2xl transition-smooth font-bold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 inline-flex items-center justify-center gap-2 ${tone.confirm}`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
