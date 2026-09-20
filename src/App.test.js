import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import App from './App';

describe('App Root Component', () => {
  test('renders application layout with navigation header', () => {
    const { container } = renderWithProviders(<App />);
    expect(container.querySelector('.app-container')).toBeInTheDocument();
    expect(screen.getByText(/NNT ACADEMY/i)).toBeInTheDocument();
    expect(screen.getByText(/Trang chủ/i)).toBeInTheDocument();
  });

  test('renders admin navigation link when user is authenticated with ADMIN role', () => {
    const preloadedState = {
      user: {
        account: {
          username: 'admin_test',
          email: 'admin@quiz.com',
          roles: 'ADMIN',
          role: 'ADMIN',
          auth: true,
        },
        isAuthenticated: true,
      },
    };

    renderWithProviders(<App />, { preloadedState });
    expect(screen.getByText(/Quản trị NNT/i)).toBeInTheDocument();
  });
});
