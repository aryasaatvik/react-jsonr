import { describe, it, expect, vi } from 'vitest';
import { transformJsonTree } from '../src/transformation';
import type { JsonNode, TransformVisitor } from '../src/types';

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
        if (!node.props) node.props = {};
        node.props['data-testid'] = `test-${node.type}`;
      }
    };

    // Transform the tree
    const result = await transformJsonTree(jsonTree, [visitor]);

    // Check the result - should have data-testid props
    expect(result.props).toBeDefined();
    expect(result.props!['data-testid']).toBe('test-div');
    expect(result.children?.[0].props?.['data-testid']).toBe('test-h1');
    expect(result.children?.[1].props?.['data-testid']).toBe('test-p');
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
        enterSpy(node.type);
        if (node.type === 'div') {
          context.skipChildren();
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
        visited.push(`enter-${node.type}`);
      },
      exit: (node) => {
        visited.push(`exit-${node.type}`);
      }
    };

    // Test pre-order traversal
    await transformJsonTree(jsonTree, [visitor], { order: 'depthFirstPre' });

    // Expected order: enter-root, enter-a, exit-a, enter-b, exit-b, exit-root
    expect(visited).toEqual([
      'enter-root', 'enter-a', 'exit-a', 'enter-b', 'exit-b', 'exit-root'
    ]);
  });
}); 