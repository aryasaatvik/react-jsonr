import React from 'react';
import { createPortal } from 'react-dom';
import { expect, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  renderNode,
  FRAGMENT,
  PORTAL,
  ComponentRegistry,
  isPrimitiveNode,
  isComponentNode,
  isArrayNode,
  createComponentNode,
  createFragment,
  createPortal as createPortalNode,
  JsonNode
} from '../src';

describe('ReactNode Support', () => {
  // Basic component registry for tests
  const registry: ComponentRegistry = {
    'div': 'div',
    'span': 'span',
    'p': 'p',
    'h1': 'h1',
    [FRAGMENT]: React.Fragment,
    [PORTAL]: ({ container, children }: { container: string, children: React.ReactNode }) => {
      return createPortal(children, document.getElementById(container) || document.body);
    }
  };

  it('should render primitive string children', () => {
    const json = {
      type: 'div',
      children: 'Hello, world!'
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('Hello, world!');
    expect(container.querySelector('div')).not.toBeNull();
  });

  it('should render primitive number children', () => {
    const json = {
      type: 'div',
      children: 42
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('42');
  });

  it('should render primitive boolean children', () => {
    const json = {
      type: 'div',
      children: true
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('');
  });

  it('should render mixed array of primitive children', () => {
    const json = {
      type: 'div',
      children: ['Hello', ' ', 42, ' ', true]
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('Hello 42 ');
  });

  it('should render nested primitives and components', () => {
    const json = {
      type: 'div',
      children: [
        'Start: ',
        {
          type: 'span',
          props: {
            key: 'nested-span',
          },
          children: ['Nested ', 123]
        },
        ' End'
      ]
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('Start: Nested 123 End');
    expect(container.querySelector('span')).not.toBeNull();
  });

  it('should render React Fragment with children', () => {
    const json = {
      type: FRAGMENT,
      children: [
        {
          type: 'div',
          props: {
            key: 'fragment-item-1',
          },
          children: 'Item 1'
        },
        {
          type: 'div',
          props: {
            key: 'fragment-item-2',
          },
          children: 'Item 2'
        }
      ]
    };

    const { container } = render(renderNode(json, registry));

    const divs = container.querySelectorAll('div');
    expect(divs.length).toBe(2);
    expect(divs[0].textContent).toBe('Item 1');
    expect(divs[1].textContent).toBe('Item 2');
  });

  it('should render null and undefined children', () => {
    const json = {
      type: 'div',
      children: [null, undefined, 'Visible']
    };

    const { container } = render(renderNode(json, registry));

    expect(container.textContent).toBe('Visible');
  });

  it('should handle Portal rendering', () => {
    // Create portal target
    const portalTarget = document.createElement('div');
    portalTarget.id = 'portal-target';
    document.body.appendChild(portalTarget);

    const json: JsonNode = {
      type: 'div',
      children: [
        'Main content',
        {
          type: PORTAL,
          props: {
            key: 'portal',
            container: '#portal-target'
          },
          children: {
            type: 'div',
            props: {
              'data-testid': 'portal-content'
            },
            children: 'Portal content'
          }
        }
      ]
    };

    render(renderNode(json, registry));

    // Check main content
    expect(screen.getByText('Main content')).toBeDefined();

    // Check portal content
    const portalContent = screen.getByTestId('portal-content');
    expect(portalContent).toBeDefined();
    expect(portalContent.textContent).toBe('Portal content');
    expect(portalTarget.contains(portalContent)).toBe(true);

    // Cleanup
    document.body.removeChild(portalTarget);
  });

  describe('Type Guards', () => {
    it('should identify primitive nodes', () => {
      expect(isPrimitiveNode('string')).toBe(true);
      expect(isPrimitiveNode(42)).toBe(true);
      expect(isPrimitiveNode(true)).toBe(true);
      expect(isPrimitiveNode(null)).toBe(true);
      expect(isPrimitiveNode(undefined)).toBe(true);

      expect(isPrimitiveNode({ type: 'div' })).toBe(false);
      expect(isPrimitiveNode([])).toBe(false);
    });

    it('should identify component nodes', () => {
      expect(isComponentNode({ type: 'div' })).toBe(true);
      expect(isComponentNode({ type: 'span', children: 'text' })).toBe(true);

      expect(isComponentNode('string')).toBe(false);
      expect(isComponentNode(42)).toBe(false);
      expect(isComponentNode([])).toBe(false);
      expect(isComponentNode(null)).toBe(false);
    });

    it('should identify array nodes', () => {
      expect(isArrayNode([])).toBe(true);
      expect(isArrayNode(['string', 42])).toBe(true);

      expect(isArrayNode('string')).toBe(false);
      expect(isArrayNode({ type: 'div' })).toBe(false);
    });
  });

  describe('Node Creation Functions', () => {
    it('should create component nodes', () => {
      const node = createComponentNode('div', { className: 'test', key: 'key1' }, 'Text');

      expect(node.type).toBe('div');
      expect(node.props?.className).toBe('test');
      expect(node.children).toBe('Text');
      expect(node.props?.key).toBe('key1');
    });

    it('should create Fragment nodes', () => {
      const node = createFragment(['Item 1', 'Item 2'], 'key2');

      expect(node.type).toBe(FRAGMENT);
      expect(node.children).toEqual(['Item 1', 'Item 2']);
      expect(node.props?.key).toBe('key2');
    });

    it('should create Portal nodes', () => {
      const node = createPortalNode('#target', { type: 'div', children: 'Portal content' });

      expect(node.type).toBe(PORTAL);
      expect(node.props?.container).toBe('#target');
      expect(node.children).toEqual({ type: 'div', children: 'Portal content' });
    });
  });

  it('should handle deeply nested and mixed content', () => {
    const complexNode = {
      type: 'div',
      props: { className: 'container' },
      children: [
        'Text at root',
        {
          props: {
            key: 'nested-div',
          },
          type: 'div',
          children: [
            {
              props: {
                key: 'nested-span-1',
              },
              type: 'span',
              children: 'Span 1'
            },
            {
              props: {
                key: 'nested-span-2',
              },
              type: 'span',
              children: [42, ' is the answer']
            },
            createFragment([
              {
                props: {
                  key: 'nested-p-1',
                },
                type: 'p',
                children: 'Paragraph 1'
              },
              {
                props: {
                  key: 'nested-p-2',
                },
                type: 'p',
                children: 'Paragraph 2'
              }
            ],
              'nested-fragment'
            )
          ]
        },
        null,
        undefined,
        [1, 2, 3],
        createComponentNode('h1', {
          key: 'heading'
        }, 'Heading')
      ]
    };

    const { container } = render(renderNode(complexNode, registry));

    // Check that content is rendered correctly
    expect(container.textContent).toContain('Text at root');
    expect(container.textContent).toContain('Span 1');
    expect(container.textContent).toContain('42 is the answer');
    expect(container.textContent).toContain('Paragraph 1');
    expect(container.textContent).toContain('Paragraph 2');
    expect(container.textContent).toContain('123');
    expect(container.textContent).toContain('Heading');

    // Check structure
    expect(container.querySelectorAll('div').length).toBe(2);
    expect(container.querySelectorAll('span').length).toBe(2);
    expect(container.querySelectorAll('p').length).toBe(2);
    expect(container.querySelector('h1')).not.toBeNull();
  });

  it('should properly assign keys to array children', () => {
    const json = {
      type: 'div',
      props: { 'data-testid': 'parent' },
      children: [
        // Mix of primitives and components
        'Text',
        {
          type: 'span',
          props: { key: 'span1', 'data-testid': 'span1' }
        },
        42,
        {
          type: 'span',
          props: { key: 'span2', 'data-testid': 'span2' }
        },
        true,
        [1, 2, 3] // Nested array
      ]
    };

    const { container } = render(renderNode(json, registry));

    // Check content is rendered correctly
    const parent = container.querySelector('[data-testid="parent"]');
    expect(parent?.textContent).toContain('Text');
    expect(parent?.textContent).toContain('42');
    expect(parent?.textContent).not.toContain('true');
    expect(parent?.textContent).toContain('123');

    // Verify spans are rendered
    const span1 = container.querySelector('[data-testid="span1"]');
    const span2 = container.querySelector('[data-testid="span2"]');
    expect(span1).not.toBeNull();
    expect(span2).not.toBeNull();

    // Check key on the span with explicit key
    expect(span2?.getAttribute('key')).toBe(null); // React doesn't put keys in DOM
  });
}); 