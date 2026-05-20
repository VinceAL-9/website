import type { Preview } from "@storybook/react";
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { initialize, mswLoader } from 'msw-storybook-addon';
import '../src/index.css';

// Initialize MSW
initialize();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  loaders: [mswLoader],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default preview;
