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