# React JSONR

React JSONR is a lightweight, extensible library that converts JSON definitions into React components. With a powerful plugin-based transformation layer and support for asynchronous processing, React JSONR enables you to build dynamic UIs driven by JSON data—while maintaining security, performance, and ease of use.

## Features

- **JSON-to-React Conversion**: Transform a JSON description of a UI into a fully-rendered React element tree.
- **Plugin-Based Transformation**: Insert synchronous or asynchronous plugins to mutate, enrich, or validate the JSON tree before rendering.
- **Flexible Traversal**: Supports configurable traversal orders (e.g., depth-first pre-order, post-order, or breadth-first) with options to skip subtrees.
- **Component Registry**: Uses a whitelist of allowed component types, ensuring that only registered components are rendered.
- **Event Handler Mapping**: Safely maps string-based event handler references (e.g., "onClick": "submitForm") to actual functions provided by your application.
- **Performance Optimizations**: Designed to handle moderately large JSON trees efficiently, with support for caching and skipping unnecessary nodes.
- **Zero External Dependencies**: Built with React (>= v18) and TypeScript, with minimal overhead.

## Installation

```bash
# npm
npm install react-jsonr

# yarn
yarn add react-jsonr

# pnpm
pnpm add react-jsonr
```

## Basic Usage

```tsx
import React, { useState, useEffect } from 'react';
import { renderNode, transformJsonTree } from 'react-jsonr';

// Define component registry
const registry = {
  Form: MyFormComponent,
  Input: MyInputComponent,
  Button: MyButtonComponent,
  div: 'div' // Native HTML elements can be included too
};

// Define event handlers
const eventHandlers = {
  submitForm: () => {
    console.log('Form submitted!');
  }
};

// Example JSON definition
const jsonDefinition = {
  type: 'Form',
  props: { title: 'Contact Us' },
  children: [
    { 
      type: 'Input',
      props: { name: 'email', label: 'Email', type: 'email' }
    },
    { 
      type: 'Button',
      props: { label: 'Submit', onClick: 'submitForm' }
    }
  ]
};

function App() {
  const [uiElement, setUiElement] = useState(null);

  useEffect(() => {
    async function buildUI() {
      // Transform JSON using plugins (empty array for no plugins)
      const transformed = await transformJsonTree(jsonDefinition, []);
      
      // Render the transformed JSON to React elements
      const element = renderNode(transformed, registry, { eventHandlers });
      
      setUiElement(element);
    }
    
    buildUI();
  }, []);

  return <div className="app">{uiElement}</div>;
}
```

## Advanced Usage with Plugins

```tsx
// Plugin to fetch data and update the JSON
const DataFetchPlugin = {
  async enter(node, context) {
    if (node.type === 'UserProfile' && node.props?.userId) {
      const userId = node.props.userId;
      const userData = await fetchUserData(userId);
      
      // Update the node with fetched data
      node.props.userData = userData;
    }
  }
};

// Plugin to add IDs to elements for analytics
const AnalyticsPlugin = {
  enter(node, context) {
    if (!node.props?.id && node.props?.onClick) {
      node.props.id = `analytics-${node.type}-${context.index}`;
    }
  }
};

// Use multiple plugins
const transformed = await transformJsonTree(jsonDefinition, [
  DataFetchPlugin,
  AnalyticsPlugin
]);
```

## Documentation

For full documentation, API reference, and more examples, see [the full documentation](https://example.com/docs).

## License

MIT 