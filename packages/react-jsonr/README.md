# React JSONR

React JSONR is a lightweight, extensible library that converts JSON definitions into React components. With a powerful plugin-based transformation layer and support for asynchronous processing, React JSONR enables you to build dynamic UIs driven by JSON data—while maintaining security, performance, and ease of use.

## Features

- **JSON-to-React Conversion**: Transform a JSON description of a UI into a fully-rendered React element tree.
- **Complete ReactNode Support**: Handle all React node types including primitives (strings, numbers, booleans), arrays, Fragment, Portal, and components.
- **Plugin-Based Transformation**: Insert synchronous or asynchronous plugins to mutate, enrich, or validate the JSON tree before rendering.
- **Flexible Traversal**: Supports configurable traversal orders (e.g., depth-first pre-order, post-order, or breadth-first) with options to skip subtrees.
- **Component Registry**: Uses a registry of allowed component types, with built-in support for all HTML elements, Fragment, and Portal.
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
import { renderNode, transformJsonTree, createRegistry } from 'react-jsonr';

// Define component registry with your custom components
// (All HTML elements, Fragment, and Portal are already included)
const registry = createRegistry({
  Form: MyFormComponent,
  Input: MyInputComponent,
  Button: MyButtonComponent
});

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

const plugins = [
  // Add your plugins here
];

// By default, transformJsonTree clones the input
// You can set clone: false to work directly with the original object
const transformed = await transformJsonTree(jsonDefinition, plugins);

const component = renderNode(transformed, registry, { eventHandlers });

function App() {
  return <div className="app">{component}</div>;
}
```

## ReactNode Support

React JSONR fully supports all React node types, allowing you to mix component nodes with primitive values:

```tsx
import { renderNode, createRegistry, FRAGMENT, PORTAL } from 'react-jsonr';

// Create registry with just your custom components
// HTML elements, Fragment, and Portal are automatically included
const registry = createRegistry({
  CustomComponent: MyCustomComponent,
  SpecialButton: ({ children, ...props }) => (
    <button className="special-btn" {...props}>{children}</button>
  )
});

// Example using different node types
const jsonDefinition = {
  type: 'div',
  children: [
    // String primitive
    'Hello ',
    
    // Number primitive
    42,
    
    // Component with array of mixed children
    {
      type: 'span',
      children: [' - ', 'Welcome', '!']
    },
    
    // React Fragment (automatically supported)
    {
      type: FRAGMENT,
      children: [
        ' ',
        { type: 'span', children: 'Multiple nodes without a wrapper' }
      ]
    },
    
    // React Portal (automatically supported)
    {
      type: PORTAL,
      props: { container: '#modal-root' },
      children: { type: 'div', children: 'Portal Content' }
    },

    // Custom component
    {
      type: 'CustomComponent',
      props: { customProp: 'value' },
      children: 'Using a custom component'
    }
  ]
};

const component = renderNode(jsonDefinition, registry);
```

## Advanced Usage with Plugins

```tsx
import { renderNode, transformJsonTree } from 'react-jsonr';

// Define plugins
const myPlugins = [
  {
    enter: (node, context) => {
      // Transform nodes on the way down the tree
      if (node.type === 'button') {
        node.props = { ...node.props, className: 'btn btn-primary' };
      }
    },
    exit: (node, context) => {
      // Transform nodes on the way up the tree
      if (node.type === 'div' && context.depth === 0) {
        node.props = { ...node.props, id: 'root-container' };
      }
    }
  }
];

// Apply transforms
const transformedJson = await transformJsonTree(jsonDefinition, myPlugins);

// Render the transformed tree
const component = renderNode(transformedJson, componentRegistry);
```

## Primitive Node Transformations

React JSONR supports transforming primitive nodes (strings, numbers, booleans) within your JSON tree:

```tsx
import { renderNode, transformJsonTree, isPrimitiveNode, createComponentNode } from 'react-jsonr';

// Define primitive transformation plugins
const primitivePlugins = [
  {
    // Convert strings to uppercase
    enter: (node, context) => {
      if (isPrimitiveNode(node) && typeof node === 'string') {
        return node.toUpperCase();
      }
    }
  },
  {
    // Format numbers
    enter: (node, context) => {
      if (isPrimitiveNode(node) && typeof node === 'number') {
        return `$${node.toFixed(2)}`;
      }
    }
  },
  {
    // Convert specific strings to component nodes
    enter: (node, context) => {
      if (isPrimitiveNode(node) && typeof node === 'string' && node.includes('important')) {
        return createComponentNode('strong', { style: { color: 'red' } }, node);
      }
    }
  }
];

// Apply transforms - primitive nodes are processed just like component nodes
const transformedJson = await transformJsonTree(jsonDefinition, primitivePlugins);

const component = renderNode(transformedJson, componentRegistry);
```

This enables powerful text transformations like:
- Converting text to uppercase/lowercase
- Formatting numbers and dates
- Pattern matching with regex to highlight or modify text
- Converting plain text to rich components based on content
- Localizing or translating strings

## Interactive Traversal with Generator

React JSONR provides a generator function for interactive traversal of the JSON tree. This gives you fine-grained control over the transformation process and allows direct modification of nodes:

```tsx
import { traverseJsonTree } from 'react-jsonr';

// Example JSON definition
const jsonDefinition = {
  type: 'Form',
  props: { title: 'Contact Us' },
  children: [
    { type: 'Input', props: { name: 'email' } },
    { type: 'Button', props: { label: 'Submit' } }
  ]
};

// By default, traverseJsonTree does not clone (clone: false)
// To avoid modifying the original, use the clone option:
// const generator = traverseJsonTree(jsonDefinition, { clone: true });

// Traverse all nodes
for (const { node, context } of traverseJsonTree(jsonDefinition)) {
  console.log(`Visiting ${node.type} at depth ${context.depth}`);
  
  // Modify nodes during traversal - changes affect the original unless clone: true
  if (node.type === 'Input') {
    node.props = { ...node.props, required: true };
  }
  
  // Skip children of a specific node if needed
  if (node.type === 'Button') {
    context.skipChildren();
  }
}

// Filter nodes by type
const inputNodes = traverseJsonTree(jsonDefinition, { 
  nodeTypes: ['Input', 'Button'] 
});

for (const { node } of inputNodes) {
  console.log(`Found a ${node.type} node`);
}

// Use different traversal orders
const postOrderTraversal = traverseJsonTree(jsonDefinition, { 
  order: 'depthFirstPost' 
});
```

Both `transformJsonTree` and `traverseJsonTree` support a consistent API. The `clone` option determines whether to clone the input (defaults to `true` for `transformJsonTree` and `false` for `traverseJsonTree`).

## Documentation

For full documentation, API reference, and more examples, see [the full documentation](https://example.com/docs).

## License

MIT 

## Testing

React-JSONR uses [Vitest](https://vitest.dev/) for unit and integration testing.

### Running Tests

To run the test suite once:

```bash
pnpm test
```

To run tests in watch mode during development:

```bash
pnpm test:watch
```

To run tests with code coverage:

```bash
pnpm test:coverage
```

### Performance Benchmarking

React-JSONR includes benchmark tests to measure and compare the performance of key operations:

```bash
pnpm bench
```

The benchmarks measure:
- Transformation performance with different tree sizes
- Transformation performance with different visitors
- Transformation performance with different traversal algorithms
- Rendering performance with different tree sizes
- End-to-end performance (transform + render)

These benchmarks are useful for identifying performance regressions when making changes to the codebase.

### Test Structure

The tests are organized as follows:

- `test/transformation.test.ts` - Tests for the JSON tree transformation functionality
- `test/rendering.test.tsx` - Tests for the React rendering functionality
- `test/integration.test.tsx` - Integration tests that combine transformation and rendering
- `test/types.test.ts` - Type validation tests
- `test/benchmark.bench.ts` - Performance benchmark tests

### Code Coverage

The project uses V8's coverage provider to generate coverage reports. Current coverage:

- Rendering: Good coverage (>90%)
- Transformation: Partial coverage (~50%, needs more tests)

To improve coverage:
- Add tests for depthFirstPostOrder and breadthFirst traversal modes
- Add more edge case tests

### Writing Tests

When writing tests, follow these guidelines:

1. Use descriptive test names that explain what functionality is being tested
2. Keep test cases focused on testing a single piece of functionality
3. Use unique data-testid attributes when testing rendered components
4. Mock external dependencies when necessary 
