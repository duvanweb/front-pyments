import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { PaymentRepositoryProvider } from '@/infrastructure/providers/PaymentRepositoryContext';
import { persistor, store } from '@/infrastructure/store';
import { MobileLayout } from '@/ui/components/layouts/MobileLayout';
import { PaymentPage } from '@/ui/pages/PaymentPage';

/**
 * Raíz de la app: Redux Provider → PersistGate (rehidrata el slice de pago)
 * → PaymentRepositoryProvider (inyección del puerto) → MobileLayout → PaymentPage.
 */
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaymentRepositoryProvider>
          <MobileLayout>
            <PaymentPage />
          </MobileLayout>
        </PaymentRepositoryProvider>
      </PersistGate>
    </Provider>
  );
}
