import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '../../components/ThemeProvider';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
};

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };