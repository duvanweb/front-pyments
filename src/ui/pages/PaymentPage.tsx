import { useState, type FormEvent } from 'react';
import type { Currency, PaymentMethod } from '@/domain/models/payment';
import type { Transaction, TransactionStatus } from '@/domain/models/transaction';
import { SUPPORTED_CURRENCIES, SUPPORTED_METHODS } from '@/domain/rules/payment-validation.rules';
import { useGetPaymentHistory } from '@/ui/hooks/useGetPaymentHistory';
import { useProcessPayment } from '@/ui/hooks/useProcessPayment';

const STATUS_BADGE: Record<TransactionStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<TransactionStatus, string> = {
  PENDING: 'Pendiente',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
};

const METHOD_LABEL: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Tarjeta de crédito',
  DEBIT_CARD: 'Tarjeta débito',
  PSE: 'PSE',
  CASH: 'Efectivo',
};

function formatAmount(amountInCents: number, currency: Currency): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(amountInCents / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
}

/** Tarjeta de transacción: CSS Grid (monto/fecha + badge de estado). */
function TransactionCard({ transaction }: { transaction: Transaction }) {
  const { payment, status, updatedAt } = transaction;
  return (
    <article className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-lg font-semibold text-slate-900">
          {formatAmount(payment.amountInCents, payment.currency)}
        </p>
        <p className="text-xs text-slate-500">
          {METHOD_LABEL[payment.method]} · {formatDate(updatedAt)}
        </p>
      </div>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[status]}`}>
        {STATUS_LABEL[status]}
      </span>
    </article>
  );
}

/** Página principal: formulario de pago + última transacción + historial. */
export function PaymentPage() {
  const { processPayment, currentTransaction, flowStatus, error } = useProcessPayment();
  const { history, refresh } = useGetPaymentHistory();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('COP');
  const [method, setMethod] = useState<PaymentMethod>('CREDIT_CARD');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amountInCents = Math.round(Number.parseFloat(amount) * 100);
    try {
      await processPayment({ amountInCents, currency, method });
      setAmount('');
      await refresh();
    } catch {
      // El error ya quedó reflejado en el store y se muestra bajo el formulario.
    }
  };

  return (
    <>
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Nuevo pago</h2>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Monto
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="10000"
              className="rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Moneda
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value as Currency)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
              Método
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-base font-normal text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
              >
                {SUPPORTED_METHODS.map((code) => (
                  <option key={code} value={code}>
                    {METHOD_LABEL[code]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="submit"
            disabled={flowStatus === 'processing'}
            className="rounded-lg bg-brand-500 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {flowStatus === 'processing' ? 'Procesando…' : 'Pagar'}
          </button>
        </form>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      {currentTransaction && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold text-slate-900">Última transacción</h2>
          <TransactionCard transaction={currentTransaction} />
        </section>
      )}

      <section className="flex flex-1 flex-col gap-3">
        <h2 className="text-base font-semibold text-slate-900">Historial</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Aún no hay transacciones.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((transaction) => (
              <li key={transaction.id}>
                <TransactionCard transaction={transaction} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
