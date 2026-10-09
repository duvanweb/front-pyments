import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAppSelector } from '@/infrastructure/store/hooks';
import { useTransactionStatus } from '@/ui/hooks/useTransactionStatus';

/** Segundos antes de auto-redirigir al producto. */
const AUTO_REDIRECT_SECONDS = 5;

/**
 * Página de resultado de transacción.
 * Se reached cuando Wompi redirige de vuelta a la app.
 * Consulta el estado de la transacción, lo muestra al usuario y
 * redirige a la página del producto con el inventario actualizado.
 */
export function TransactionResultPage() {
  const navigate = useNavigate();
  const { transactionId, productId } = useAppSelector((state) => state.checkout);
  const { status, transaction, loading, error } = useTransactionStatus(transactionId);

  const [countdown, setCountdown] = useState(AUTO_REDIRECT_SECONDS);

  // Si no hay transactionId, redirigir al home.
  useEffect(() => {
    if (!transactionId) {
      navigate('/', { replace: true });
    }
  }, [transactionId, navigate]);

  // Auto-redirect con countdown cuando hay un estado terminal.
  useEffect(() => {
    if (loading || !productId) return;
    if (status !== 'APPROVED' && status !== 'DECLINED' && status !== 'ERROR') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(`/products/${productId}`, { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, loading, productId, navigate]);

  // Sin transactionId — el useEffect redirige.
  if (!transactionId) return null;

  // Loading: procesando pago.
  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-stone-50 text-center">
        <Loader2 className="size-12 animate-spin text-brand-500" aria-hidden="true" />
        <div>
          <h1 className="font-display text-xl font-bold text-stone-900">
            Procesando pago...
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Estamos confirmando tu transacción. Esto puede tomar unos segundos.
          </p>
        </div>
      </div>
    );
  }

  // Error de consulta.
  if (error || (status === 'ERROR')) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-stone-50 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="size-8 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-stone-900">
            Error en la transacción
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {error ?? 'Ocurrió un error al procesar tu pago.'}
          </p>
        </div>
        {transaction && (
          <ReferenceBox reference={transaction.reference} />
        )}
        <RedirectButton productId={productId} countdown={countdown} />
      </div>
    );
  }

  // Rechazado.
  if (status === 'DECLINED') {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-stone-50 px-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-red-100">
          <XCircle className="size-8 text-red-600" aria-hidden="true" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-stone-900">
            Pago rechazado
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Tu pago fue rechazado. Puedes intentar nuevamente.
          </p>
        </div>
        {transaction && (
          <ReferenceBox reference={transaction.reference} />
        )}
        <RedirectButton productId={productId} countdown={countdown} label="Reintentar" />
      </div>
    );
  }

  // Aprobado.
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-stone-50 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="size-8 text-emerald-600" aria-hidden="true" />
      </div>
      <div>
        <h1 className="font-display text-xl font-bold text-stone-900">
          ¡Pago aprobado!
        </h1>
        <p className="mt-2 text-sm text-stone-500">
          Tu transacción fue procesada exitosamente.
        </p>
      </div>
      {transaction && (
        <ReferenceBox reference={transaction.reference} />
      )}
      <RedirectButton productId={productId} countdown={countdown} label="Finalizar" />
    </div>
  );
}

/** Caja con el número de referencia. */
function ReferenceBox({ reference }: { reference: string }) {
  return (
    <div className="w-full max-w-sm rounded-lg border border-stone-200 bg-stone-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
        Número de transacción
      </p>
      <p className="mt-1 font-display text-lg font-bold text-stone-900">
        {reference}
      </p>
    </div>
  );
}

/** Botón de redirección con countdown. */
function RedirectButton({
  productId,
  countdown,
  label = 'Volver al producto',
}: {
  productId: string | null;
  countdown: number;
  label?: string;
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => productId && navigate(`/products/${productId}`, { replace: true })}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      {label}
      <span className="text-sm opacity-70">({countdown}s)</span>
    </button>
  );
}
