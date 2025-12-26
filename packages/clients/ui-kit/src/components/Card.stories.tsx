import type { Meta, StoryObj } from '@storybook/react';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: <CardContent>Simple card content</CardContent>,
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">
          This is a card with a header section containing a title.
        </p>
      </CardContent>
    </Card>
  ),
};

export const Complete: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            John Doe
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Software Engineer
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <button className="text-primary-600 hover:text-primary-700 font-medium">
          View Profile
        </button>
      </CardFooter>
    </Card>
  ),
};

export const HoverEffect: Story = {
  args: {
    hover: true,
    padding: 'lg',
    children: (
      <CardContent>
        <p className="text-gray-600 dark:text-gray-400">
          Hover over this card to see the shadow effect.
        </p>
      </CardContent>
    ),
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Card padding="sm">
        <CardContent>Small padding</CardContent>
      </Card>
      <Card padding="md">
        <CardContent>Medium padding</CardContent>
      </Card>
      <Card padding="lg">
        <CardContent>Large padding</CardContent>
      </Card>
    </div>
  ),
};
