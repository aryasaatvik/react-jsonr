import React from 'react';
import { renderNode, transformJsonTree, TransformVisitor, isComponentNode, isPrimitiveNode, createComponentNode, createRegistry } from '../src';

// Example JSON definition with primitive values
const jsonDefinition = {
  type: 'div',
  props: { className: 'container' },
  children: [
    'Hello, world!',
    123,
    {
      type: 'span',
      children: 'This is a span'
    },
    'Click me',
    {
      type: 'button',
      children: 'Submit'
    }
  ]
};

// Define component registry with built-in HTML elements
const registry = createRegistry({
  strong: 'strong' // This is unnecessary as HTML elements are automatically included
});

// Example 1: Plugin to uppercase all string primitive nodes
const uppercaseStringsPlugin: TransformVisitor = {
  enter(node, context) {
    if (isPrimitiveNode(node) && typeof node === 'string') {
      return node.toUpperCase();
    }
  }
};

// Example 2: Plugin to format number primitive nodes
const formatNumbersPlugin: TransformVisitor = {
  enter(node, context) {
    if (isPrimitiveNode(node) && typeof node === 'number') {
      return `Number: ${node.toLocaleString()}`;
    }
  }
};

// Example 3: Plugin to wrap string nodes matching a pattern in a component
const wrapMatchingStringsPlugin: TransformVisitor = {
  enter(node, context) {
    if (isPrimitiveNode(node) && typeof node === 'string') {
      if (node.includes('Click')) {
        return createComponentNode('strong', { style: { cursor: 'pointer', color: 'blue' } }, node);
      }
    }
  }
};

// Example 4: Plugin that transforms based on parent component type
const parentAwarePlugin: TransformVisitor = {
  enter(node, context) {
    if (isPrimitiveNode(node) && typeof node === 'string' && 
        context.parent && isComponentNode(context.parent) && context.parent.type === 'button') {
      return `🚀 ${node} 🚀`;
    }
  }
};

async function applyTransformations() {
  // Apply the primitive transformation plugins
  const result = await transformJsonTree(
    jsonDefinition, 
    [
      uppercaseStringsPlugin,
      formatNumbersPlugin,
      wrapMatchingStringsPlugin,
      parentAwarePlugin
    ]
    // Primitives are now transformed by default
  );
  
  // Render the transformed JSON
  const element = renderNode(result, registry);
  
  // In a real React application, you would use this element
  console.log('Transformed element:', element);
  
  return element;
}

export default function PrimitiveTransformsExample() {
  const [element, setElement] = React.useState<React.ReactNode>(null);
  
  React.useEffect(() => {
    applyTransformations().then(setElement);
  }, []);
  
  return (
    <div className="example">
      <h2>Primitive Transformations Example</h2>
      <div className="original">
        <h3>Original JSON</h3>
        <pre>{JSON.stringify(jsonDefinition, null, 2)}</pre>
      </div>
      <div className="result">
        <h3>Rendered Result</h3>
        {element || <div>Loading...</div>}
      </div>
    </div>
  );
} 