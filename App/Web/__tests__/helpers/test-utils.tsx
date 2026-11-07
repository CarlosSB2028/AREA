import { render as testingLibraryRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import React from 'react';

// Default Mantine theme - can be customized
const theme = {
  primaryColor: 'blue',
};

/**
 * Custom render function that wraps components with MantineProvider
 * This ensures all Mantine components work correctly in tests
 * 
 * @example
 * const { getByText } = render(<MyComponent />);
 * expect(getByText('Hello')).toBeInTheDocument();
 */
export function render(ui: React.ReactNode, options = {}) {
  return testingLibraryRender(<>{ui}</>, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <MantineProvider theme={theme} env="test">
        {children}
      </MantineProvider>
    ),
    ...options,
  });
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { userEvent };
