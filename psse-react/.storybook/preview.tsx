/// <reference types="vite/client" />
import type { Preview } from '@storybook/react-vite';
import '../src/index.css';
import MockDate from 'mockdate';
import { initialize, mswLoader } from 'msw-storybook-addon';
import { UserAuthProvider } from '../src/context/UserAuthContext';
import { OrderProvider } from '../src/context/OrderContext';
import { mswHandlers } from './msw-handlers';
import { MemoryRouter } from 'react-router-dom';

initialize({ onUnhandledRequest: 'bypass' });

const preview: Preview = {
  decorators: [
    (Story) => (
      <MemoryRouter>
        <UserAuthProvider>
          <OrderProvider>
            <Story />
          </OrderProvider>
        </UserAuthProvider>
      </MemoryRouter>
    ),
  ],
  loaders: [mswLoader],
  parameters: {
    msw: { handlers: mswHandlers },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  async beforeEach() {
    MockDate.set('2024-04-01T12:00:00Z');
  },
};

export default preview;