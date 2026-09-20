import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import rootReducer from './component/actions/redux/rootReducer';

/**
 * Creates a fresh Redux store for tests with optional preloaded state.
 */
export function setupTestStore(preloadedState = {}) {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk));
}

/**
 * Custom render helper that wraps UI in Redux Provider and React Router MemoryRouter.
 *
 * @param {React.ReactElement} ui - The component under test
 * @param {Object} options
 * @param {Object} [options.preloadedState] - Initial Redux state
 * @param {Object} [options.store] - Custom store instance
 * @param {string} [options.route='/'] - Initial route path
 * @param {Array<string>} [options.initialEntries] - Custom history entries
 * @returns {Object} Render result plus store and user
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = setupTestStore(preloadedState),
    route = '/',
    initialEntries = [route],
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Helper to render custom hooks within Redux & Router context.
 */
export function renderHookWithProviders(hookFn, { preloadedState, store, ...options } = {}) {
  const result = { current: null };

  function TestHookComponent(props) {
    result.current = hookFn(props);
    return null;
  }

  const rendered = renderWithProviders(<TestHookComponent />, {
    preloadedState,
    store,
    ...options,
  });

  return {
    result,
    store: rendered.store,
    rerender: (newProps) => rendered.rerender(<TestHookComponent {...newProps} />),
  };
}

// Re-export everything from RTL
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
