import React from 'react';
import { bench, describe } from 'vitest';
import { transformJsonTree } from '../src/transformation';
import { renderNode } from '../src/rendering';
import type { JsonNode, TransformVisitor } from '../src/types';
import { isComponentNode } from '../src/types';

// Create a sample small JSON tree
const smallTree: JsonNode = {
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', props: { className: 'title' }, children: [] },
    { type: 'p', props: { className: 'text' }, children: [] }
  ]
};

// Create a larger nested JSON tree for benchmarking
const createLargeTree = (depth: number, childrenPerNode: number): JsonNode => {
  if (depth <= 0) {
    return { type: 'span', props: { className: 'leaf' }, children: [] };
  }

  const children = Array.from({ length: childrenPerNode }, () => 
    createLargeTree(depth - 1, childrenPerNode)
  );

  return {
    type: 'div',
    props: { className: `level-${depth}` },
    children
  };
};

// Create trees of different sizes
const mediumTree = createLargeTree(3, 3); // ~40 nodes
const largeTree = createLargeTree(4, 4);  // ~250+ nodes

// Simple visitor for benchmarking
const simpleVisitor: TransformVisitor = {
  enter: (node) => {
    if (isComponentNode(node)) {
      if (!node.props) node.props = {};
      node.props['data-test'] = true;
    }
  }
};

// Complex visitor with more operations
const complexVisitor: TransformVisitor = {
  enter: (node, context) => {
    if (isComponentNode(node)) {
      if (!node.props) node.props = {};
      node.props['data-depth'] = context.depth;
      node.props['data-index'] = context.index;
      node.props['data-id'] = `${node.type}-${context.depth}-${context.index}`;
      
      // Add some conditional logic
      if (context.depth > 2) {
        node.props['deep'] = true;
      }
    }
  },
  exit: (node) => {
    if (isComponentNode(node)) {
      if (!node.props) node.props = {};
      node.props['visited'] = true;
    }
  }
};

// Component registry for rendering benchmarks
const registry = {
  div: 'div',
  span: 'span',
  h1: 'h1',
  p: 'p'
};

describe('transformJsonTree performance', () => {
  bench('small tree - simple visitor', async () => {
    await transformJsonTree(smallTree, [simpleVisitor]);
  });

  bench('small tree - complex visitor', async () => {
    await transformJsonTree(smallTree, [complexVisitor]);
  });

  bench('medium tree - simple visitor', async () => {
    await transformJsonTree(mediumTree, [simpleVisitor]);
  });

  bench('medium tree - complex visitor', async () => {
    await transformJsonTree(mediumTree, [complexVisitor]);
  });

  bench('large tree - simple visitor', async () => {
    await transformJsonTree(largeTree, [simpleVisitor]);
  });

  bench('large tree - complex visitor', async () => {
    await transformJsonTree(largeTree, [complexVisitor]);
  });

  // Compare different traversal orders
  bench('large tree - depthFirstPre traversal', async () => {
    await transformJsonTree(largeTree, [simpleVisitor], { order: 'depthFirstPre' });
  });

  bench('large tree - depthFirstPost traversal', async () => {
    await transformJsonTree(largeTree, [simpleVisitor], { order: 'depthFirstPost' });
  });

  bench('large tree - breadthFirst traversal', async () => {
    await transformJsonTree(largeTree, [simpleVisitor], { order: 'breadthFirst' });
  });
});

describe('renderNode performance', () => {
  bench('render small tree', () => {
    renderNode(smallTree, registry);
  });

  bench('render medium tree', () => {
    renderNode(mediumTree, registry);
  });

  bench('render large tree', () => {
    renderNode(largeTree, registry);
  });

  // Benchmark pre-transformed trees vs direct rendering
  bench('transform then render small tree', async () => {
    const transformed = await transformJsonTree(smallTree, [simpleVisitor]);
    renderNode(transformed, registry);
  });

  bench('transform then render medium tree', async () => {
    const transformed = await transformJsonTree(mediumTree, [simpleVisitor]);
    renderNode(transformed, registry);
  });
}); 