# Front Payments

SPA **mobile-first** de pagos construida como base de referencia con **Arquitectura Hexagonal** (Puertos y Adaptadores). Diseñada para un viewport de 375×667 (iPhone SE) y escalable hacia arriba.

## Stack

- **React + TypeScript** con **Vite**
- **Tailwind CSS v4** — CSS-first (`@theme`), sin `tailwind.config.js`
- **Redux Toolkit** (arquitectura Flux) + **redux-persist**
- **Vitest** + jsdom

## Arquitectura Hexagonal

```
            ┌───────────────────────────┐
            │        UI (React)         │  MobileLayout, PaymentPage, smart hooks
            └─────────────┬─────────────┘
                          │ consume (vía hooks / Context de DI)
            ┌─────────────▼─────────────┐
            │      Application          │  Casos de uso: ProcessPayment,
            │  (casos de uso)           │  GetPaymentHistory
            └─────────────┬─────────────┘
                          │ usa puertos (interfaces)
            ┌─────────────▼─────────────┐
            │         Domain            │  Entidades Payment/Transaction,
            │  (reglas de negocio)      │  reglas puras, puertos
            └─────────────▲─────────────┘
                          │ implementado por adaptadores
            ┌─────────────┴─────────────┐
            │      Infrastructure       │  localStorage / API (adaptadores),
            │                           │  Redux store, DI
            └───────────────────────────┘
```

**Regla de dependencias (la ley del hexágono):**

- `domain` → **no importa nada**. TypeScript puro: cero React, cero Tailwind, cero Redux.
- `application` → solo importa `domain`. Orquesta entidades y puertos.
- `infrastructure` → implementa los puertos de `domain` e integra Redux y storage.
- `ui` → consume `application`/`domain` a través de **smart hooks**; accede al store solo vía `@/infrastructure/store` y al puerto solo vía `PaymentRepositoryContext` (inyección de dependencias).

**Intercambio de adaptadores** — para pasar de localStorage a HTTP basta inyectar el otro adaptador en la raíz, sin tocar UI ni casos de uso:

```tsx
<PaymentRepositoryProvider repository={new ApiPaymentRepository('https://api.ejemplo.com/payments')}>
```

## Estructura

```
src/
├── main.tsx / App.tsx / index.css
├── domain/                      # CERO dependencias externas
│   ├── models/                  # payment.ts, transaction.ts
│   ├── rules/                   # payment-validation.rules.ts (funciones puras)
│   └── ports/                   # payment-repository.port.ts (contratos outbound)
├── application/
│   └── use-cases/               # process-payment, get-payment-history
├── infrastructure/
│   ├── adapters/                # local-storage-payment.repository, api-payment.repository
│   ├── storage/                 # safe-storage.ts (wrapper seguro de localStorage)
│   ├── store/                   # Redux: index.ts, payment.slice.ts, hooks.ts
│   └── providers/               # PaymentRepositoryContext.tsx (DI)
└── ui/
    ├── components/              # common/ (Atomic UI futura), layouts/MobileLayout
    ├── hooks/                   # useProcessPayment, useGetPaymentHistory
    └── pages/                   # PaymentPage
```

## Persistencia (dos roles, un mismo storage seguro)

1. **`LocalStoragePaymentRepository`** (puerto hexagonal) — fuente de verdad del registro de transacciones (clave `front-pyments:transactions`, historial máximo de 20).
2. **redux-persist** — rehidrata el slice `payment` del store (clave `persist:front-pyments`) para que la UI recupere su estado tras recargar.

Ambos usan `SafeStorage`: si el navegador bloquea `localStorage` (modo privado, cuota excedida) la app degrada sin romperse. Al montar, `useGetPaymentHistory` re-sincroniza el store desde el repositorio.

## Instalación y ejecución

```bash
npm install
npm run dev        # http://localhost:5173
npm run test       # tests de reglas de dominio y del adaptador
npm run build      # compilación de producción (tsc + vite)
npm run lint       # ESLint
```

## Verificación de persistencia y layout

1. Abre `http://localhost:5173` con DevTools en modo responsive **iPhone SE (375×667)**: layout header/contenido/footer sin scroll horizontal, centrado con `max-w-md`.
2. Crea un pago (monto, moneda, método) → aparece la tarjeta con su estado y el historial.
3. **Recarga la página** → la última transacción y el historial siguen ahí.
4. En DevTools → Application → Local Storage verás las claves `persist:front-pyments` (redux-persist) y `front-pyments:transactions` (repositorio).
5. `npm run test` y `npm run build` deben terminar en verde.

## Decisiones técnicas

- Montos en **centavos enteros** (`amountInCents`) para evitar errores de coma flotante.
- `min-h-dvh` + `env(safe-area-inset-*)` para iOS (evita el salto de `100vh` y respeta el notch).
- Inputs con `text-base` (16px) para prevenir el zoom automático de iOS al enfocar.
- Flexbox para columnas/formularios y CSS Grid para header y tarjetas.
- `resolveTransactionStatus` es una **simulación determinista** del gateway (umbral de rechazo en `DECLINE_THRESHOLD_IN_CENTS`) — reemplazar por la integración real.

## Roadmap

- [ ] Integración real del gateway de pagos (adaptador `ApiPaymentRepository` + backend)
- [ ] Router (`react-router-dom`) cuando exista más de una página
- [ ] Tests de componentes con Testing Library
- [ ] CI (GitHub Actions: lint + test + build)
