import React from 'react';
import { describe, it, expect } from 'vitest';
import { transformJsonTree } from '../src/transformation';
import { renderNode } from '../src/rendering';
import type { JsonNode, TransformVisitor, ComponentRegistry } from '../src/types';
import { render } from '@testing-library/react';
import { isComponentNode } from '../src/types';

describe('Integration: transformJsonTree and renderNode', () => {
  it('should transform and then render a JSON tree', async () => {
    // Create a sample JSON tree
    const jsonTree: JsonNode = {
      type: 'div',
      props: { className: 'container' },
      children: [
        {
          key: 'title',
          type: 'h1',
          props: { className: 'title' },
          children: [],
        },
        {
          key: 'paragraph',
          type: 'p',
          props: { className: 'text' },
          children: [],
        }
      ]
    };

    // Create a simple visitor that adds data-testid props
    const visitor: TransformVisitor = {
      enter: (node) => {
        if (isComponentNode(node) && node.props) {
          node.props['data-testid'] = `test-${node.type}`;
        }
      }
    };

    // Transform the tree
    const transformedTree = await transformJsonTree(jsonTree, [visitor]);

    // Create a registry
    const registry: ComponentRegistry = {
      div: 'div',
      h1: 'h1',
      p: 'p'
    };

    // Render the transformed tree
    const element = renderNode(transformedTree, registry);
    const { getByTestId } = render(<>{element}</>);
    
    // Assert that all elements were rendered with the correct props
    const divElement = getByTestId('test-div');
    expect(divElement).toBeDefined();
    expect(divElement.tagName).toBe('DIV');
    expect(divElement.className).toBe('container');

    const h1Element = getByTestId('test-h1');
    expect(h1Element).toBeDefined();
    expect(h1Element.tagName).toBe('H1');
    expect(h1Element.className).toBe('title');

    const pElement = getByTestId('test-p');
    expect(pElement).toBeDefined();
    expect(pElement.tagName).toBe('P');
    expect(pElement.className).toBe('text');
  });

  it('should handle complex transformations and rendering', async () => {
    // Create a sample JSON tree with nested structure
    const jsonTree: JsonNode = {
      type: 'section',
      props: { id: 'main-content' },
      children: [
        {
          key: 'header',
          type: 'div',
          props: { className: 'header' },
          children: [
            {
              key: 'title',
              type: 'h1',
              props: { className: 'title' },
              children: []
            }
          ]
        },
        {
          key: 'body',
          type: 'div',
          props: { className: 'body' },
          children: [
            {
              key: 'paragraph',
              type: 'p',
              props: { className: 'paragraph' },
              children: []
            },
            {
              key: 'button',
              type: 'button',
              props: { className: 'btn', onClick: 'handleClick' },
              children: []
            }
          ]
        }
      ]
    };

    // Create visitors for transformations
    const addTestIds: TransformVisitor = {
      enter: (node, context) => {
        if (isComponentNode(node) && node.props) {
          // Create unique test IDs combining type, depth and index
          node.props['data-testid'] = `${node.type}-${context.depth}-${context.index}`;
        }
      }
    };
    
    const addKeys: TransformVisitor = {
      enter: (node, context) => {
        // Add keys based on index and depth
        if (isComponentNode(node) && node.props) {
          node.props['data-testid'] = `${node.type}-${context.depth}-${context.index}`;
        }
      }
    };

    // Transform the tree with multiple visitors
    const transformedTree = await transformJsonTree(jsonTree, [addTestIds, addKeys]);

    // Create a registry
    const registry: ComponentRegistry = {
      section: 'section',
      div: 'div',
      h1: 'h1',
      p: 'p',
      button: 'button'
    };

    // Set up event handler
    const eventHandlers = {
      handleClick: () => {}
    };

    // Render the transformed tree
    const element = renderNode(transformedTree, registry, { eventHandlers });
    const { getByTestId } = render(<>{element}</>);
    
    // Test the rendered structure
    const sectionElement = getByTestId('section-0-0');
    expect(sectionElement).toBeDefined();
    expect(sectionElement.tagName).toBe('SECTION');
    
    const headerDiv = getByTestId('div-1-0');
    expect(headerDiv).toBeDefined();
    expect(headerDiv.className).toBe('header');
    
    const bodyDiv = getByTestId('div-1-1');
    expect(bodyDiv).toBeDefined();
    expect(bodyDiv.className).toBe('body');
    
    const h1Element = getByTestId('h1-2-0');
    expect(h1Element).toBeDefined();
    expect(h1Element.className).toBe('title');
    
    const pElement = getByTestId('p-2-0');
    expect(pElement).toBeDefined();
    expect(pElement.className).toBe('paragraph');
    
    const buttonElement = getByTestId('button-2-1');
    expect(buttonElement).toBeDefined();
    expect(buttonElement.className).toBe('btn');
  });
}); 