# React-JSONR Event Handlers Plugin

A plugin for React-JSONR that maps string event handler references to actual functions.

## Installation

```bash
# npm
npm install @react-jsonr/plugin-event-handlers

# yarn
yarn add @react-jsonr/plugin-event-handlers

# pnpm
pnpm add @react-jsonr/plugin-event-handlers
```

## Usage

```tsx
import React from 'react';
import { renderNode, transformJsonTree, createRegistry } from 'react-jsonr';
import { createEventHandlerPlugin } from '@react-jsonr/plugin-event-handlers';

// Define your event handlers
const eventHandlers = {
  submitForm: () => {
    alert('Form submitted!');
  },
  handleChange: (e) => {
    console.log('Input changed:', e.target.value);
  }
};

// Create the event handler plugin
const eventHandlerPlugin = createEventHandlerPlugin({
  handlers: eventHandlers
});

// Define your UI as JSON
const jsonDefinition = {
  type: 'Form',
  props: {
    onSubmit: 'submitForm' // This will be mapped to the actual function
  },
  children: [
    {
      type: 'Input',
      props: {
        type: 'text',
        onChange: 'handleChange' // This will be mapped to the actual function
      }
    }
  ]
};

// Transform the JSON tree with the plugin
const transformed = await transformJsonTree(jsonDefinition, [eventHandlerPlugin]);

// Create a component registry
const registry = createRegistry({
  Form: ({ children, ...props }) => (
    <form {...props}>{children}</form>
  ),
  Input: (props) => <input {...props} />
});

// Render the component
const element = renderNode(transformed, registry);
```

## Options

The `createEventHandlerPlugin` function accepts an options object with the following properties:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `handlers` | `Record<string, Function>` | (required) | Map of event handler names to functions |
| `prefix` | `string` | `'on'` | Custom prefix for event handler props |
| `warnOnMissing` | `boolean` | `true` | Whether to warn when an event handler is not found |

## Example with Custom Options

```tsx
const eventHandlerPlugin = createEventHandlerPlugin({
  handlers: eventHandlers,
  prefix: 'handle', // Will only transform props starting with 'handle'
  warnOnMissing: false // Silently ignore missing event handlers
});
```

## License

MIT 