# @graphwiz/ui-kit

A modern React component library for GraphWiz-XR built with TypeScript, Tailwind CSS, and Vite.

## Installation

```bash
npm install @graphwiz/ui-kit
```

### Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install react react-dom
```

## Usage

### Import Components

```tsx
import { Button, Input, Card, Modal, Spinner } from '@graphwiz/ui-kit';
import '@graphwiz/ui-kit/styles';
```

### Button Component

```tsx
import { Button } from '@graphwiz/ui-kit';

function App() {
  return (
    <>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button isLoading>Loading</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}
```

### Input Component

```tsx
import { Input } from '@graphwiz/ui-kit';

function App() {
  return (
    <>
      <Input label="Email" type="email" placeholder="user@example.com" />
      <Input
        label="Password"
        type="password"
        error="Password is required"
      />
      <Input
        label="Username"
        helperText="Choose a unique username"
      />
    </>
  );
}
```

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@graphwiz/ui-kit';

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
      <CardFooter>
        <Button>Footer Action</Button>
      </CardFooter>
    </Card>
  );
}
```

### Modal Component

```tsx
import { Modal } from '@graphwiz/ui-kit';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
      >
        <p>Modal content goes here.</p>
      </Modal>
    </>
  );
}
```

### Spinner Component

```tsx
import { Spinner } from '@graphwiz/ui-kit';

function App() {
  return (
    <>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner color="white" />
    </>
  );
}
```

## Development

### Build the Library

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Storybook

Run Storybook to see all components in action:

```bash
npm run storybook
```

Build Storybook static files:

```bash
npm run build-storybook
```

## Component Props

### Button

- `variant`: 'primary' | 'secondary' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `isLoading`: boolean (default: false)
- `fullWidth`: boolean (default: false)
- `disabled`: boolean
- Extends all standard HTML button attributes

### Input

- `label`: string
- `error`: string
- `helperText`: string
- `fullWidth`: boolean (default: false)
- Extends all standard HTML input attributes

### Card

- `padding`: 'none' | 'sm' | 'md' | 'lg' (default: 'md')
- `hover`: boolean (default: false)

### Modal

- `isOpen`: boolean (required)
- `onClose`: function (required)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)
- `showCloseButton`: boolean (default: true)

### Spinner

- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `color`: 'primary' | 'white' | 'gray' (default: 'primary')

## Styling

This library uses Tailwind CSS for styling. The library includes its own Tailwind configuration and CSS bundle that can be imported:

```tsx
import '@graphwiz/ui-kit/styles';
```

## License

MIT
