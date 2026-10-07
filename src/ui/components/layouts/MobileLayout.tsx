import type { ReactNode } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
}

/**
 * Layout Mobile-First: diseñado para 375×667 (iPhone SE) y escala hacia
 * arriba con sm:/md:/lg:. Flexbox para la columna (header / main / footer)
 * y CSS Grid en el header. min-h-dvh evita el salto de 100vh en iOS Safari
 * y los safe-area-inset respetan el notch en dispositivos con notch.
 */
export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50">
      <header className="grid grid-cols-[auto_1fr] items-center gap-3 border-b border-slate-200 bg-white px-4 pb-3 pt-[calc(0.75rem_+_env(safe-area-inset-top))]">
        <span
          className="flex size-9 items-center justify-center rounded-lg bg-brand-500 text-lg text-white"
          aria-hidden="true"
        >
          💳
        </span>
        <h1 className="truncate text-lg font-semibold text-slate-900">Front Payments</h1>
        {/* Slot para acciones futuras en el header */}
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">{children}</main>

      <footer className="border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem_+_env(safe-area-inset-bottom))] pt-3 text-center text-xs text-slate-500">
        Arquitectura Hexagonal · Mobile-First · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
