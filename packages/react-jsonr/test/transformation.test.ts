import { describe, it, expect, vi } from 'vitest';
import { transformJsonTree } from '../src/transformation';
import type { JsonNode, TransformVisitor } from '../src/types';
import { traverseJsonTree } from '../src/transformation';
import { isComponentNode } from '../src/types';

describe('transformJsonTree', () => {
  it('should apply visitors to nodes', async () => {
    // Create a sample JSON tree
    const jsonTree: JsonNode = {
      type: 'div',
      props: { className: 'container' },
      children: [
        {
          type: 'h1',
          props: { className: 'title' },
          children: [],
        },
        {
          type: 'p',
          props: { className: 'text' },
          children: [],
        }
      ]
    };

    // Create a simple visitor that adds a data-testid prop
    const visitor: TransformVisitor = {
      enter: (node) => {
        if (isComponentNode(node)) {
          if (!node.props) node.props = {};
          node.props['data-testid'] = `test-${node.type}`;
        }
      }
    };

    // Transform the tree
    const result = await transformJsonTree(jsonTree, [visitor]);

    // Check the result - should have data-testid props
    if (isComponentNode(result)) {
      expect(result.props).toBeDefined();
      expect(result.props!['data-testid']).toBe('test-div');
      
      if (Array.isArray(result.children)) {
        const child0 = result.children[0];
        const child1 = result.children[1];
        
        if (isComponentNode(child0) && isComponentNode(child1)) {
          expect(child0.props?.['data-testid']).toBe('test-h1');
          expect(child1.props?.['data-testid']).toBe('test-p');
        }
      }
    } else {
      throw new Error('Expected result to be a component node');
    }
  });

  it('should allow skipping children', async () => {
    const jsonTree: JsonNode = {
      type: 'div',
      children: [
        { type: 'span', children: [] },
        { type: 'p', children: [] }
      ]
    };

    const enterSpy = vi.fn();
    const visitor: TransformVisitor = {
      enter: (node, context) => {
        if (isComponentNode(node)) {
          enterSpy(node.type);
          if (node.type === 'div') {
            context.skipChildren();
          }
        }
      }
    };

    await transformJsonTree(jsonTree, [visitor]);

    // Should only call enter for 'div', not for children
    expect(enterSpy).toHaveBeenCalledTimes(1);
    expect(enterSpy).toHaveBeenCalledWith('div');
  });

  it('should handle different traversal orders', async () => {
    const jsonTree: JsonNode = {
      type: 'root',
      children: [
        { type: 'a', children: [] },
        { type: 'b', children: [] }
      ]
    };

    const visited: string[] = [];
    const visitor: TransformVisitor = {
      enter: (node) => {
        if (isComponentNode(node)) {
          visited.push(`enter-${node.type}`);
        }
      },
      exit: (node) => {
        if (isComponentNode(node)) {
          visited.push(`exit-${node.type}`);
        }
      }
    };

    // Test pre-order traversal
    await transformJsonTree(jsonTree, [visitor], { order: 'depthFirstPre' });

    // Expected order: enter-root, enter-a, exit-a, enter-b, exit-b, exit-root
    expect(visited).toEqual([
      'enter-root', 'enter-a', 'exit-a', 'enter-b', 'exit-b', 'exit-root'
    ]);
  });

  it('should respect clone option', async () => {
    const json = {
      type: 'div',
      children: [
        { type: 'span', props: { text: 'Hello' } }
      ]
    };

    // By default (clone: true), the original should not be modified
    await transformJsonTree(json, [{
      enter(node) {
        if (isComponentNode(node) && node.type === 'span' && node.props) {
          node.props.text = 'Modified';
        }
      }
    }]);
    
    expect(json.children[0].props?.text).toBe('Hello');

    // With clone: false, the original should be modified
    await transformJsonTree(json, [{
      enter(node) {
        if (isComponentNode(node) && node.type === 'span' && node.props) {
          node.props.text = 'Modified';
        }
      }
    }], { clone: false });
    
    expect(json.children[0].props?.text).toBe('Modified');
  });
});

describe('traverseJsonTree', () => {
  it('should yield all nodes by default', () => {
    const json = {
      type: 'root',
      children: [
        { type: 'child1' },
        { 
          type: 'child2',
          children: [
            { type: 'grandchild' }
          ]
        }
      ]
    };

    const generator = traverseJsonTree(json);
    const results = Array.from(generator);
    
    expect(results.length).toBe(4);
    expect(results.map(r => isComponentNode(r.node) ? r.node.type : null).filter(Boolean))
      .toEqual(['root', 'child1', 'child2', 'grandchild']);
  });

  it('should filter nodes by type', () => {
    const json = {
      type: 'div',
      children: [
        { type: 'span' },
        { 
          type: 'button',
          children: [
            { type: 'span' }
          ]
        }
      ]
    };

    const generator = traverseJsonTree(json, { nodeTypes: ['span'] });
    const results = Array.from(generator);
    
    expect(results.length).toBe(2);
    expect(results.map(r => isComponentNode(r.node) ? r.node.type : null).filter(Boolean))
      .toEqual(['span', 'span']);
  });

  it('should allow modifying nodes during traversal', () => {
    const json = {
      type: 'div',
      children: [
        { type: 'p', props: { text: 'Hello' } },
        { type: 'p', props: { text: 'World' } }
      ]
    };

    const generator = traverseJsonTree(json, { 
      nodeTypes: ['p'],
      clone: false // Explicitly set to false to ensure modifications affect the original
    });
    
    for (const { node } of generator) {
      if (isComponentNode(node) && node.type === 'p' && node.props) {
        node.props.text = node.props.text.toUpperCase();
      }
    }
    
    // Type assertion to access the children properly
    if (isComponentNode(json) && Array.isArray(json.children)) {
      const child0 = json.children[0];
      const child1 = json.children[1];
      
      if (isComponentNode(child0) && isComponentNode(child1)) {
        expect(child0.props?.text).toBe('HELLO');
        expect(child1.props?.text).toBe('WORLD');
      }
    }
  });

  it('should respect traversal order', () => {
    const json = {
      type: 'root',
      children: [
        { type: 'child1' },
        { 
          type: 'child2',
          children: [
            { type: 'grandchild' }
          ]
        }
      ]
    };

    // Test depth-first post-order
    const postOrderGenerator = traverseJsonTree(json, { order: 'depthFirstPost' });
    const postOrderResults = Array.from(postOrderGenerator)
      .filter(result => isComponentNode(result.node))
      .map(result => ({ ...result, nodeType: (result.node as any).type }));
    
    expect(postOrderResults.map(r => r.nodeType)).toEqual(['child1', 'grandchild', 'child2', 'root']);
    
    // Test breadth-first
    const bfsGenerator = traverseJsonTree(json, { order: 'breadthFirst' });
    const bfsResults = Array.from(bfsGenerator)
      .filter(result => isComponentNode(result.node))
      .map(result => ({ ...result, nodeType: (result.node as any).type }));
    
    expect(bfsResults.map(r => r.nodeType)).toEqual(['root', 'child1', 'child2', 'grandchild']);
  });

  it('should respect skipChildren in context', () => {
    const json = {
      type: 'root',
      children: [
        { type: 'child1' },
        { 
          type: 'child2',
          children: [
            { type: 'grandchild' }
          ]
        }
      ]
    };

    const generator = traverseJsonTree(json);
    const results: string[] = [];
    
    for (const { node, context } of generator) {
      if (isComponentNode(node)) {
        results.push(node.type);
        
        // Skip child2's children
        if (node.type === 'child2') {
          context.skipChildren();
        }
      }
    }
    
    expect(results).toEqual(['root', 'child1', 'child2']);
  });

  it('should respect clone option', () => {
    const json = {
      type: 'div',
      children: [
        { type: 'p', props: { text: 'Hello' } },
        { type: 'p', props: { text: 'World' } }
      ]
    };

    // By default (clone: false), modifications affect the original
    const generator1 = traverseJsonTree(json, { clone: false });
    
    for (const { node } of generator1) {
      if (isComponentNode(node) && node.type === 'p' && node.props) {
        node.props.text = 'MODIFIED';
      }
    }
    
    expect(json.children[0].props?.text).toBe('MODIFIED');
    
    // Reset the text
    if (json.children[0].props) json.children[0].props.text = 'Hello';
    if (json.children[1].props) json.children[1].props.text = 'World';
    
    // With clone: true, the original should not be modified
    const generator2 = traverseJsonTree(json, { clone: true });
    
    for (const { node } of generator2) {
      if (isComponentNode(node) && node.type === 'p' && node.props) {
        node.props.text = 'CHANGED';
      }
    }
    
    // Original should remain unchanged
    expect(json.children[0].props?.text).toBe('Hello');
    expect(json.children[1].props?.text).toBe('World');
  });
}); 