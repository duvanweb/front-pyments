import { useState } from 'react';
import type { Product } from '@/domain/models/product';
import type { CustomerData } from '@/domain/models/customer';
import type { ShippingAddress } from '@/domain/models/shipping-address';
import type { CreditCardData } from '@/domain/models/credit-card';
import {
  LEGAL_ID_TYPES,
  validateCreditCard,
  validateCustomer,
  validateShippingAddress,
} from '@/domain/rules/checkout-validation.rules';
import {
  resetCheckout,
  updateCreditCard,
  updateCustomer,
  updateShippingAddress,
} from '@/infrastructure/store/checkout.slice';
import { useAppDispatch, useAppSelector } from '@/infrastructure/store/hooks';
import { useCreateTransaction } from '@/ui/hooks/useCreateTransaction';
import { CardNumberInput } from './CardNumberInput';
import { FormField } from './FormField';
import { PaymentSummary } from './PaymentSummary';
import { TransactionResult } from './TransactionResult';

interface CheckoutFormProps {
  /** Producto que se está comprando. */
  product: Product;
  /** Cantidad seleccionada. */
  quantity: number;
  /** Callback al cerrar el modal. */
  onClose: () => void;
}

/** Clase base para inputs. */
const inputClass =
  'rounded-lg border bg-white px-3 py-2.5 text-base text-stone-900 outline-none transition-colors focus:border-brand-500 placeholder:text-stone-400';

/** Clase para inputs con error. */
const inputErrorClass = 'border-red-400';
/** Clase para inputs sin error. */
const inputOkClass = 'border-stone-300';

/**
 * Formulario de checkout dentro del modal de compra.
 * Recoge datos del cliente, dirección de envío y tarjeta de crédito.
 * Los datos se persisten en Redux (checkout slice) para sobrevivir recargas.
 * Al pagar, crea una transacción PENDIENTE vía POST /api/transactions.
 */
export function CheckoutForm({ product, quantity, onClose }: CheckoutFormProps) {
  const dispatch = useAppDispatch();
  const { customer, shippingAddress, creditCard, status, transactionReference, error } =
    useAppSelector((state) => state.checkout);
  const { createTransaction } = useCreateTransaction();

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const customerErrors = validateCustomer(customer);
  const shippingErrors = validateShippingAddress(shippingAddress);
  const cardErrors = validateCreditCard(creditCard);

  /** Devuelve el error de un campo si fue tocado o se intentó enviar. */
  function fieldError(errors: Record<string, string>, field: string): string | undefined {
    if (!touched[field] && !submitAttempted) return undefined;
    return errors[field] || undefined;
  }

  /** Marca un campo como tocado al perder el foco. */
  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  /** Actualiza un campo del cliente en Redux. */
  function setCustomerField(field: keyof CustomerData, value: string) {
    dispatch(updateCustomer({ [field]: value }));
    // Conveniencia: sincronizar el teléfono de envío con el del cliente.
    if (field === 'phoneNumber') {
      dispatch(updateShippingAddress({ phoneNumber: value }));
    }
  }

  /** Actualiza un campo de la dirección en Redux. */
  function setShippingField(field: keyof ShippingAddress, value: string) {
    dispatch(updateShippingAddress({ [field]: value }));
  }

  /** Actualiza un campo de la tarjeta en Redux. */
  function setCardField(field: keyof CreditCardData, value: string) {
    dispatch(updateCreditCard({ [field]: value }));
  }

  async function handlePay() {
    setSubmitAttempted(true);

    const hasErrors =
      Object.keys(customerErrors).length > 0 ||
      Object.keys(shippingErrors).length > 0 ||
      Object.keys(cardErrors).length > 0;

    if (hasErrors) return;

    await createTransaction({
      productId: product.id,
      quantity,
      productPrice: product.price,
      customer,
      shippingAddress,
    });
  }

  function handleClose() {
    dispatch(resetCheckout());
    onClose();
  }

  // Pantalla de éxito: transacción creada.
  if (status === 'success' && transactionReference) {
    return <TransactionResult reference={transactionReference} onClose={handleClose} />;
  }

  const loading = status === 'submitting';

  return (
    <div className="space-y-6">
      {/* Error global del backend */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Sección 1: Datos del cliente */}
      <section className="space-y-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
          Datos del cliente
        </h3>

        <FormField label="Correo electrónico" required error={fieldError(customerErrors, 'email')}>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => setCustomerField('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="cliente@example.com"
            className={`${inputClass} w-full ${fieldError(customerErrors, 'email') ? inputErrorClass : inputOkClass}`}
          />
        </FormField>

        <FormField label="Nombre completo" required error={fieldError(customerErrors, 'fullName')}>
          <input
            type="text"
            value={customer.fullName}
            onChange={(e) => setCustomerField('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder="Juan Pérez"
            className={`${inputClass} w-full ${fieldError(customerErrors, 'fullName') ? inputErrorClass : inputOkClass}`}
          />
        </FormField>

        <div className="flex gap-2">
          <FormField label="Prefijo" required error={fieldError(customerErrors, 'phoneNumberPrefix')}>
            <select
              value={customer.phoneNumberPrefix}
              onChange={(e) => setCustomerField('phoneNumberPrefix', e.target.value)}
              onBlur={() => handleBlur('phoneNumberPrefix')}
              className={`${inputClass} ${fieldError(customerErrors, 'phoneNumberPrefix') ? inputErrorClass : inputOkClass}`}
            >
              <option value="+57">+57</option>
              <option value="+1">+1</option>
              <option value="+34">+34</option>
              <option value="+52">+52</option>
              <option value="+54">+54</option>
              <option value="+56">+56</option>
            </select>
          </FormField>

          <div className="flex-1">
            <FormField label="Teléfono" required error={fieldError(customerErrors, 'phoneNumber')}>
              <input
                type="tel"
                value={customer.phoneNumber}
                onChange={(e) => setCustomerField('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="3001234567"
                className={`${inputClass} w-full ${fieldError(customerErrors, 'phoneNumber') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>
        </div>

        <div className="flex gap-2">
          <FormField label="Tipo de doc." error={fieldError(customerErrors, 'legalIdType')}>
            <select
              value={customer.legalIdType ?? ''}
              onChange={(e) => setCustomerField('legalIdType', e.target.value)}
              onBlur={() => handleBlur('legalIdType')}
              className={`${inputClass} ${fieldError(customerErrors, 'legalIdType') ? inputErrorClass : inputOkClass}`}
            >
              <option value="">—</option>
              {LEGAL_ID_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex-1">
            <FormField label="Nº de doc.">
              <input
                type="text"
                value={customer.legalId ?? ''}
                onChange={(e) => setCustomerField('legalId', e.target.value)}
                placeholder="Opcional"
                className={`${inputClass} w-full ${inputOkClass}`}
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* Sección 2: Dirección de envío */}
      <section className="space-y-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
          Dirección de envío
        </h3>

        <FormField label="Dirección" required error={fieldError(shippingErrors, 'addressLine1')}>
          <input
            type="text"
            value={shippingAddress.addressLine1}
            onChange={(e) => setShippingField('addressLine1', e.target.value)}
            onBlur={() => handleBlur('addressLine1')}
            placeholder="Calle 123 #45-67"
            className={`${inputClass} w-full ${fieldError(shippingErrors, 'addressLine1') ? inputErrorClass : inputOkClass}`}
          />
        </FormField>

        <FormField label="Dirección 2 (opcional)">
          <input
            type="text"
            value={shippingAddress.addressLine2 ?? ''}
            onChange={(e) => setShippingField('addressLine2', e.target.value)}
            placeholder="Apto, suite, etc."
            className={`${inputClass} w-full ${inputOkClass}`}
          />
        </FormField>

        <div className="flex gap-2">
          <div className="w-24">
            <FormField label="País" required error={fieldError(shippingErrors, 'country')}>
              <input
                type="text"
                value={shippingAddress.country}
                onChange={(e) => setShippingField('country', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('country')}
                maxLength={2}
                placeholder="CO"
                className={`${inputClass} w-full ${fieldError(shippingErrors, 'country') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>

          <div className="flex-1">
            <FormField label="Ciudad" required error={fieldError(shippingErrors, 'city')}>
              <input
                type="text"
                value={shippingAddress.city}
                onChange={(e) => setShippingField('city', e.target.value)}
                onBlur={() => handleBlur('city')}
                placeholder="Bogotá"
                className={`${inputClass} w-full ${fieldError(shippingErrors, 'city') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>
        </div>

        <FormField label="Región / Departamento" required error={fieldError(shippingErrors, 'region')}>
          <input
            type="text"
            value={shippingAddress.region}
            onChange={(e) => setShippingField('region', e.target.value)}
            onBlur={() => handleBlur('region')}
            placeholder="Cundinamarca"
            className={`${inputClass} w-full ${fieldError(shippingErrors, 'region') ? inputErrorClass : inputOkClass}`}
          />
        </FormField>

        <div className="flex gap-2">
          <div className="flex-1">
            <FormField label="Teléfono de contacto" required error={fieldError(shippingErrors, 'phoneNumber')}>
              <input
                type="tel"
                value={shippingAddress.phoneNumber}
                onChange={(e) => setShippingField('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('shippingPhoneNumber')}
                placeholder="3001234567"
                className={`${inputClass} w-full ${fieldError(shippingErrors, 'phoneNumber') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>

          <div className="flex-1">
            <FormField label="Código postal (opcional)">
              <input
                type="text"
                value={shippingAddress.postalCode ?? ''}
                onChange={(e) => setShippingField('postalCode', e.target.value)}
                placeholder="110111"
                className={`${inputClass} w-full ${inputOkClass}`}
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* Sección 3: Tarjeta de crédito */}
      <section className="space-y-3">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-stone-500">
          Tarjeta de crédito
        </h3>

        <CardNumberInput
          value={creditCard.number}
          onChange={(v) => setCardField('number', v)}
          error={fieldError(cardErrors, 'number')}
        />

        <FormField label="Nombre del titular" required error={fieldError(cardErrors, 'holder')}>
          <input
            type="text"
            value={creditCard.holder}
            onChange={(e) => setCardField('holder', e.target.value)}
            onBlur={() => handleBlur('holder')}
            placeholder="JUAN PEREZ"
            className={`${inputClass} w-full ${fieldError(cardErrors, 'holder') ? inputErrorClass : inputOkClass}`}
          />
        </FormField>

        <div className="flex gap-2">
          <div className="flex-1">
            <FormField label="Vencimiento" required error={fieldError(cardErrors, 'expiry')}>
              <input
                type="text"
                value={creditCard.expiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`;
                  setCardField('expiry', val);
                }}
                onBlur={() => handleBlur('expiry')}
                placeholder="MM/YY"
                className={`${inputClass} w-full ${fieldError(cardErrors, 'expiry') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>

          <div className="w-28">
            <FormField label="CVV" required error={fieldError(cardErrors, 'cvv')}>
              <input
                type="text"
                inputMode="numeric"
                value={creditCard.cvv}
                onChange={(e) => setCardField('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                onBlur={() => handleBlur('cvv')}
                placeholder="123"
                className={`${inputClass} w-full ${fieldError(cardErrors, 'cvv') ? inputErrorClass : inputOkClass}`}
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* Sección 4: Resumen del pago */}
      <PaymentSummary product={product} quantity={quantity} loading={loading} onPay={handlePay} />
    </div>
  );
}
