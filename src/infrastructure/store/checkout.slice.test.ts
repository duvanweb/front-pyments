import { describe, expect, it } from 'vitest';
import checkoutReducer, {
  startCheckout,
  updateCustomer,
  updateShippingAddress,
  updateCreditCard,
  setQuantity,
  setSubmitting,
  setSuccess,
  setCheckoutError,
  resetCheckout,
  type CheckoutState,
} from './checkout.slice';

describe('checkout.slice', () => {
  const initialState: CheckoutState = {
    productId: null,
    quantity: 1,
    customer: { email: '', fullName: '', phoneNumber: '', phoneNumberPrefix: '+57' },
    shippingAddress: { addressLine1: '', country: 'CO', city: '', region: '', phoneNumber: '' },
    creditCard: { number: '', holder: '', expiry: '', cvv: '' },
    status: 'idle',
    transactionReference: null,
    error: null,
  };

  describe('startCheckout', () => {
    it('establece productId, quantity y status form', () => {
      const state = checkoutReducer(
        initialState,
        startCheckout({ productId: 'prod-1', quantity: 3 }),
      );
      expect(state.productId).toBe('prod-1');
      expect(state.quantity).toBe(3);
      expect(state.status).toBe('form');
      expect(state.error).toBeNull();
      expect(state.transactionReference).toBeNull();
    });
  });

  describe('updateCustomer', () => {
    it('fusiona parcialmente los datos del cliente', () => {
      const state = checkoutReducer(
        initialState,
        updateCustomer({ email: 'test@example.com' }),
      );
      expect(state.customer.email).toBe('test@example.com');
      expect(state.customer.phoneNumberPrefix).toBe('+57');
    });
  });

  describe('updateShippingAddress', () => {
    it('fusiona parcialmente la dirección de envío', () => {
      const state = checkoutReducer(
        initialState,
        updateShippingAddress({ city: 'Medellín' }),
      );
      expect(state.shippingAddress.city).toBe('Medellín');
      expect(state.shippingAddress.country).toBe('CO');
    });
  });

  describe('updateCreditCard', () => {
    it('fusiona parcialmente los datos de la tarjeta', () => {
      const state = checkoutReducer(
        initialState,
        updateCreditCard({ number: '4242424242424242' }),
      );
      expect(state.creditCard.number).toBe('4242424242424242');
      expect(state.creditCard.holder).toBe('');
    });
  });

  describe('setQuantity', () => {
    it('actualiza la cantidad', () => {
      const state = checkoutReducer(initialState, setQuantity(5));
      expect(state.quantity).toBe(5);
    });
  });

  describe('setSubmitting', () => {
    it('establece status submitting y limpia el error', () => {
      const errorState = { ...initialState, error: 'previo' };
      const state = checkoutReducer(errorState, setSubmitting());
      expect(state.status).toBe('submitting');
      expect(state.error).toBeNull();
    });
  });

  describe('setSuccess', () => {
    it('establece status success y la referencia', () => {
      const state = checkoutReducer(initialState, setSuccess('REF-001'));
      expect(state.status).toBe('success');
      expect(state.transactionReference).toBe('REF-001');
      expect(state.error).toBeNull();
    });
  });

  describe('setCheckoutError', () => {
    it('establece status error y el mensaje', () => {
      const state = checkoutReducer(initialState, setCheckoutError('falló'));
      expect(state.status).toBe('error');
      expect(state.error).toBe('falló');
    });
  });

  describe('resetCheckout', () => {
    it('restaura el estado inicial', () => {
      const modified: CheckoutState = {
        ...initialState,
        status: 'success',
        transactionReference: 'REF-001',
        quantity: 5,
      };
      const state = checkoutReducer(modified, resetCheckout());
      expect(state).toEqual(initialState);
    });
  });
});
