import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/test-utils';
import { MobileLayout } from './MobileLayout';

describe('MobileLayout', () => {
  it('renders children inside the main area', () => {
    renderWithProviders(
      <MobileLayout>
        <div data-testid="child">Hello</div>
      </MobileLayout>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders the header with the app title', () => {
    renderWithProviders(
      <MobileLayout>
        <div>content</div>
      </MobileLayout>,
    );
    expect(screen.getByText('Front Payments')).toBeInTheDocument();
  });

  it('renders the footer with the current year', () => {
    renderWithProviders(
      <MobileLayout>
        <div>content</div>
      </MobileLayout>,
    );
    expect(screen.getByText(`Arquitectura Hexagonal · Mobile-First · ${new Date().getFullYear()}`)).toBeInTheDocument();
  });
});
