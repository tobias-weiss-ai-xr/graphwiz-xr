/* eslint-disable react-hooks/rules-of-hooks */
import type { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';

import { Button } from './Button';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Default Modal"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This is a default modal with a title and close button.
          </p>
        </Modal>
      </>
    );
  },
};

export const WithoutTitle: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          showCloseButton={false}
        >
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This modal has no title and no close button.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </Modal>
      </>
    );
  },
};

export const Small: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Small Modal"
          size="sm"
        >
          <p className="text-gray-600 dark:text-gray-400">
            This is a small modal.
          </p>
        </Modal>
      </>
    );
  },
};

export const Large: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Large Modal"
          size="xl"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              This is a large modal with more space for content.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              You can put more content here, such as forms or detailed information.
            </p>
          </div>
        </Modal>
      </>
    );
  },
};

export const NoOverlayClick: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="No Overlay Click"
          closeOnOverlayClick={false}
        >
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This modal cannot be closed by clicking the overlay. Use the close button or press Escape.
            </p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </Modal>
      </>
    );
  },
};
