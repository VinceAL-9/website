import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Footer } from './Footer';

const meta = {
  title: 'Layout/Footer',
  component: Footer,
  parameters: {
    // The footer is full width and usually sits at the bottom, so 'padded' or 'fullscreen' is better than 'centered'
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify organization info exists (using getAllByText since it appears multiple times)
    const orgTexts = canvas.getAllByText(/Philippine Society of Software Engineers/i);
    expect(orgTexts.length).toBeGreaterThan(0);
    
    // Verify all social links are rendered
    const facebookLink = canvas.getByLabelText(/Facebook/i);
    const instagramLink = canvas.getByLabelText(/Instagram/i);
    const githubLink = canvas.getByLabelText(/GitHub/i);
    const linkedinLink = canvas.getByLabelText(/LinkedIn/i);

    expect(facebookLink).toBeInTheDocument();
    expect(instagramLink).toBeInTheDocument();
    expect(githubLink).toBeInTheDocument();
    expect(linkedinLink).toBeInTheDocument();

    // Verify copyright text exists
    const currentYear = new Date().getFullYear();
    const copyrightTexts = canvas.getAllByText(new RegExp(currentYear.toString(), 'i'));
    expect(copyrightTexts.length).toBeGreaterThan(0);
  },
};
