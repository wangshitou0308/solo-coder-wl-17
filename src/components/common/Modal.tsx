import { useEffect, type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-6xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  className,
  contentClassName,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn(
          'absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => closeOnOverlayClick && onClose()}
      />

      <div
        className={cn(
          'relative w-full z-10 transform transition-all duration-300',
          sizeClasses[size],
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          className
        )}
      >
        <div
          className={cn(
            'relative bg-slate-900 border border-slate-700/60 rounded-xl shadow-2xl overflow-hidden',
            'before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary-500/5 before:to-transparent before:pointer-events-none'
          )}
        >
          {(title || showCloseButton || Icon) && (
            <div className="relative flex items-start justify-between gap-4 p-5 border-b border-slate-700/60">
              <div className="flex items-start gap-3 min-w-0">
                {Icon && (
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 border border-primary-500/30 flex items-center justify-center shadow-glow-sm">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                )}
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-base font-semibold text-white tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          <div
            className={cn(
              'relative overflow-y-auto max-h-[60vh]',
              title || showCloseButton || Icon ? 'p-5' : 'p-5 rounded-t-xl',
              contentClassName
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="relative flex flex-col-reverse sm:flex-row sm:justify-end sm:items-center gap-2 p-4 border-t border-slate-700/60 bg-slate-900/50">
              {footer}
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

interface ModalActionProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const variantClasses: Record<NonNullable<ModalActionProps['variant']>, string> = {
  primary:
    'bg-primary-600 hover:bg-primary-500 text-white shadow-glow-sm hover:shadow-glow border-primary-500/30',
  secondary:
    'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600/60',
  danger:
    'bg-rose-600 hover:bg-rose-500 text-white shadow-sm border-rose-500/30',
  ghost:
    'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white border-transparent',
};

export function ModalAction({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  type = 'button',
  className,
}: ModalActionProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </button>
  );
}
