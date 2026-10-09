import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renderiza la etiqueta', () => {
    renderWithProviders(
      <FormField label="Correo electrónico">
        <input />
      </FormField>,
    );
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
  });

  it('muestra el asterisco cuando es required', () => {
    renderWithProviders(
      <FormField label="Nombre" required>
        <input />
      </FormField>,
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('no muestra el asterisco cuando no es required', () => {
    renderWithProviders(
      <FormField label="Nombre">
        <input />
      </FormField>,
    );
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('muestra el mensaje de error cuando se proporciona', () => {
    renderWithProviders(
      <FormField label="Nombre" error="El nombre es obligatorio">
        <input />
      </FormField>,
    );
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
  });

  it('no muestra mensaje de error cuando no se proporciona', () => {
    renderWithProviders(
      <FormField label="Nombre">
        <input />
      </FormField>,
    );
    expect(screen.queryByText('El nombre es obligatorio')).not.toBeInTheDocument();
  });

  it('renderiza el children', () => {
    renderWithProviders(
      <FormField label="Campo">
        <input data-testid="child-input" />
      </FormField>,
    );
    expect(screen.getByTestId('child-input')).toBeInTheDocument();
  });
});
