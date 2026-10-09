import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/es/integration/react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { PaymentRepositoryProvider } from '@/infrastructure/providers/PaymentRepositoryContext';
import { ProductRepositoryProvider } from '@/infrastructure/providers/ProductRepositoryContext';
import { TransactionRepositoryProvider } from '@/infrastructure/providers/TransactionRepositoryContext';
import { persistor, store } from '@/infrastructure/store';
import { MobileLayout } from '@/ui/components/layouts/MobileLayout';
import { PaymentPage } from '@/ui/pages/PaymentPage';
import { ProductDetailPage } from '@/ui/pages/ProductDetailPage';
import { ProductListPage } from '@/ui/pages/ProductListPage';
import { TransactionResultPage } from '@/ui/pages/TransactionResultPage';

/**
 * Raíz de la app: Redux Provider → PersistGate → DI providers → Router.
 *
 * La vista principal es el listado de productos (/). El flujo de pagos
 * existente queda en /payment con su MobileLayout.
 */
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaymentRepositoryProvider>
          <ProductRepositoryProvider>
            <TransactionRepositoryProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<ProductListPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/transaction/result" element={<TransactionResultPage />} />
                  <Route
                    path="/payment"
                    element={
                      <MobileLayout>
                        <PaymentPage />
                      </MobileLayout>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </BrowserRouter>
            </TransactionRepositoryProvider>
          </ProductRepositoryProvider>
        </PaymentRepositoryProvider>
      </PersistGate>
    </Provider>
  );
}
