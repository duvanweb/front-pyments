import type { ReactNode } from 'react';

interface FormFieldProps {
  /** Etiqueta visible del campo. */
  label: string;
  /** Mensaje de error (vacío = sin error). */
  error?: string;
  /** Si el campo es obligatorio (muestra *). */
  required?: boolean;
  /** Contenido del campo (input, select, etc.). */
  children: ReactNode;
}

/**
 * Wrapper reutilizable para campos de formulario.
 * Renderiza etiqueta, el campo (children) y mensaje de error.
 */
export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-stone-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
