import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

/**
 * Página de detalle del producto.
 * Por ahora es un componente en blanco: solo header con botón de regreso.
 * El id se lee de los parámetros de ruta para uso futuro.
 */
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex size-9 items-center justify-center rounded-lg border border-stone-300 text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            aria-label="Volver al listado"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
          <h1 className="font-display text-xl font-bold text-stone-900">Detalle del producto</h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <p className="text-sm text-stone-500">Próximamente — id: {id}</p>
      </main>
    </div>
  );
}
