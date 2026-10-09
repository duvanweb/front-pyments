import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { CreditCardData } from '@/domain/models/credit-card';
import type { CustomerData } from '@/domain/models/customer';
import type { ShippingAddress } from '@/domain/models/shipping-address';

/** Estado del flujo de checkout en la UI. */
export type CheckoutStatus = 'idle' | 'form' | 'submitting' | 'success' | 'error';

export interface CheckoutState {
  /** ID del producto en checkout, o null si no hay checkout activo. */
  productId: string | null;
  /** Cantidad seleccionada. */
  quantity: number;
  /** Datos del cliente (persistidos para sobrevivir recargas). */
  customer: CustomerData;
  /** Dirección de envío (persistida). */
  shippingAddress: ShippingAddress;
  /** Datos de la tarjeta (falsos, persistidos para UX). */
  creditCard: CreditCardData;
  /** Estado del flujo. */
  status: CheckoutStatus;
  /** Referencia de la transacción creada (visible al usuario). */
  transactionReference: string | null;
  /** Mensaje de error si status === 'error'. */
  error: string | null;
}

const initialState: CheckoutState = {
  productId: null,
  quantity: 1,
  customer: {
    email: '',
    fullName: '',
    phoneNumber: '',
    phoneNumberPrefix: '+57',
  },
  shippingAddress: {
    addressLine1: '',
    country: 'CO',
    city: '',
    region: '',
    phoneNumber: '',
  },
  creditCard: {
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  },
  status: 'idle',
  transactionReference: null,
  error: null,
};

/**
 * Slice de checkout: estado del formulario de pago persistido con redux-persist.
 * Si el usuario recarga el navegador a mitad del checkout, los datos del
 * formulario y el estado del flujo se restauran desde localStorage.
 */
const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    /** Inicia el checkout para un producto y cantidad. */
    startCheckout(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      state.productId = action.payload.productId;
      state.quantity = action.payload.quantity;
      state.status = 'form';
      state.error = null;
      state.transactionReference = null;
    },
    /** Actualiza parcialmente los datos del cliente. */
    updateCustomer(state, action: PayloadAction<Partial<CustomerData>>) {
      Object.assign(state.customer, action.payload);
    },
    /** Actualiza parcialmente la dirección de envío. */
    updateShippingAddress(state, action: PayloadAction<Partial<ShippingAddress>>) {
      Object.assign(state.shippingAddress, action.payload);
    },
    /** Actualiza parcialmente los datos de la tarjeta. */
    updateCreditCard(state, action: PayloadAction<Partial<CreditCardData>>) {
      Object.assign(state.creditCard, action.payload);
    },
    /** Actualiza la cantidad. */
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
    },
    /** Marca el inicio del envío de la transacción. */
    setSubmitting(state) {
      state.status = 'submitting';
      state.error = null;
    },
    /** Transacción creada exitosamente. */
    setSuccess(state, action: PayloadAction<string>) {
      state.status = 'success';
      state.transactionReference = action.payload;
      state.error = null;
    },
    /** Error al crear la transacción. */
    setCheckoutError(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
    /** Resetea el checkout al estado inicial. */
    resetCheckout() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Tras rehidratar desde localStorage: si estábamos en 'submitting'
    // (la llamada API fue interrumpida por la recarga), volver a 'form'
    // para que el usuario pueda reenviar. 'form' y 'success' se preservan.
    builder.addCase(REHYDRATE, (state) => {
      if (state.status === 'submitting') {
        state.status = 'form';
      }
    });
  },
});

export const {
  startCheckout,
  updateCustomer,
  updateShippingAddress,
  updateCreditCard,
  setQuantity,
  setSubmitting,
  setSuccess,
  setCheckoutError,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
