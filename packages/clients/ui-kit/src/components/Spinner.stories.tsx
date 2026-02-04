import type { Meta, StoryObj } from '@storybook/react';

import { Card } from './Card';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['primary', 'white', 'gray'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {},
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};

export const White: Story = {
  args: {
    color: 'white',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};

export const Gray: Story = {
  args: {
    color: 'gray',
  },
};

export const InCard: Story = {
  render: () => (
    <Card>
      <div className="flex items-center justify-center space-x-4">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
    </Card>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center justify-center space-x-8">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const AllColors: Story = {
  render: () => (
    <div className="flex items-center justify-center space-x-8">
      <Spinner color="primary" />
      <Spinner color="gray" />
      <div className="bg-gray-800 p-4 rounded">
        <Spinner color="white" />
      </div>
    </div>
  ),
};
