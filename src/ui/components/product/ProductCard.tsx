import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/domain/models/product';

interface ProductCardProps {
  product: Product;
}

/**
 * Tarjeta de producto: imagen + título + botón "Ver más".
 * El botón navega al detalle del producto (/products/:id).
 * Diseño minimalista: la imagen es el foco visual, el cromo es quiet.
 */
export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md">
      <div className="aspect-square overflow-hidden bg-stone-100">
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-stone-900">
          {product.title}
        </h3>

        <button
          type="button"
          onClick={() => navigate(`/products/${product.id}`)}
          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          Ver más
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
