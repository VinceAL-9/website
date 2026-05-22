import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import CreateEventModal from './CreateEventModal';
import { Button } from '../common';
import { http, HttpResponse, delay } from 'msw';

const meta = {
  title: 'Features/CreateEventModal',
  component: CreateEventModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CreateEventModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultArgs: React.ComponentProps<typeof CreateEventModal> = {
  isOpen: false,
  onClose: () => {},
};

const ModalWrapper = (args: React.ComponentProps<typeof CreateEventModal>) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <Button onClick={() => setIsOpen(true)}>Open Create Event Modal</Button>
      <CreateEventModal 
        {...args} 
        isOpen={args.isOpen !== undefined ? args.isOpen : isOpen} 
        onClose={() => {
          setIsOpen(false);
          args.onClose?.();
        }} 
      />
    </div>
  );
};

const fillCreateEventForm = async (canvas: ReturnType<typeof within>) => {
  const titleInput = canvas.getByLabelText(/event title/i) as HTMLInputElement;
  const descriptionInput = canvas.getByLabelText(/description/i) as HTMLTextAreaElement;
  const dateInput = canvas.getByLabelText(/event date/i) as HTMLInputElement;
  const locationInput = canvas.getByLabelText(/location/i) as HTMLInputElement;
  const imageInput = canvas.getByLabelText(/event image/i) as HTMLInputElement;

  await userEvent.clear(titleInput);
  await userEvent.type(titleInput, 'PSSE Hackathon');

  await userEvent.clear(descriptionInput);
  await userEvent.type(descriptionInput, 'A one-day build sprint for the community.');

  await userEvent.clear(dateInput);
  await userEvent.type(dateInput, '2024-06-01T10:30');

  await userEvent.clear(locationInput);
  await userEvent.type(locationInput, 'Main Hall');

  const file = new File(['demo'], 'event.png', { type: 'image/png' });
  await userEvent.upload(imageInput, file);

  expect(imageInput.files?.[0]?.name).toBe('event.png');
  expect(await canvas.findByAltText(/preview/i)).toBeInTheDocument();

  return { titleInput, descriptionInput, dateInput, locationInput, imageInput };
};

export const Default: Story = {
  args: {
    ...defaultArgs,
    isOpen: true
  },

  render: (args) => <ModalWrapper {...args} />,

  parameters: {
    msw: {
      handlers: [
        http.post('*/events', async () => {
          await delay(800);
          return HttpResponse.json({
            id: 'new-event-1',
            title: 'Mocked Event',
            description: 'Mocked description',
            date: new Date().toISOString(),
            imageUrl: 'mock.jpg',
            location: 'Mock Location',
            isUpcoming: true,
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await fillCreateEventForm(canvas);

    const submitButton = canvas.getByRole('button', { name: /create event/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(submitButton).toBeDisabled());
    // Wait for the modal to close or toast to appear, indicating success
    // Since we don't have a direct way to check toast, we check the button state change
    await waitFor(() => expect(submitButton).toBeEnabled());
  },
};

export const SubmitErrorSadPath: Story = {
  args: {
    ...defaultArgs,
    isOpen: true
  },

  render: (args) => <ModalWrapper {...args} />,

  parameters: {
    msw: {
      handlers: [
        http.post('*/events', async () => {
          await delay(800);
          return new HttpResponse(JSON.stringify({ message: 'Failed to upload image due to file size limits.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }),
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const { titleInput, descriptionInput, dateInput, locationInput } = await fillCreateEventForm(canvas);

    const submitButton = canvas.getByRole('button', { name: /create event/i });
    await userEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    await waitFor(() => expect(submitButton).toBeEnabled());

    expect(titleInput).toHaveValue('PSSE Hackathon');
    expect(descriptionInput).toHaveValue('A one-day build sprint for the community.');
    expect(dateInput).toHaveValue('2024-06-01T10:30');
    expect(locationInput).toHaveValue('Main Hall');
  },
};
